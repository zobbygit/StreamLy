const { z } = require("zod");
const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const User = require("../models/User");
const AuditLog = require("../models/AuditLog");
const Notification = require("../models/Notification");
const asyncHandler = require("../utils/asyncHandler");
const cloudinary = require("../config/cloudinary");

// List all conversations (1:1 and group) for the logged-in user, with last
// message + unread count.
const getConversations = asyncHandler(async (req, res) => {
  const conversations = await Conversation.find({ participants: req.user._id })
    .sort({ lastMessageAt: -1 })
    .populate("participants", "name email avatar lastSeen");

  // A conversation this user "deleted" stays hidden until a new message
  // arrives after the point they deleted it (lastMessageAt moves past
  // hiddenAt) — matches how most chat apps' "delete chat" behaves.
  const visible = conversations.filter((c) => {
    const hidden = c.hiddenFor.find((h) => h.userId.toString() === req.user._id.toString());
    if (!hidden) return true;
    return new Date(c.lastMessageAt) > new Date(hidden.hiddenAt);
  });

  const results = await Promise.all(
    visible.map(async (c) => {
      const unreadCount = c.isGroup
        ? await Message.countDocuments({
            conversationId: c._id,
            senderId: { $ne: req.user._id },
            readBy: { $ne: req.user._id },
          })
        : await Message.countDocuments({
            conversationId: c._id,
            receiverId: req.user._id,
            read: false,
          });

      if (c.isGroup) {
        return {
          conversationId: c._id,
          isGroup: true,
          name: c.name,
          participants: c.participants,
          lastMessage: c.lastMessage,
          lastMessageAt: c.lastMessageAt,
          unreadCount,
        };
      }

      const other = c.participants.find(
        (p) => p._id.toString() !== req.user._id.toString()
      );
      return {
        conversationId: c._id,
        isGroup: false,
        user: other,
        lastMessage: c.lastMessage,
        lastMessageAt: c.lastMessageAt,
        unreadCount,
      };
    })
  );

  res.json({ conversations: results });
});

const startConversationSchema = z.object({
  userId: z.string().min(1),
});

const startConversation = asyncHandler(async (req, res) => {
  const { userId } = startConversationSchema.parse(req.body);

  if (userId === req.user._id.toString()) {
    return res.status(400).json({ message: "You cannot message yourself." });
  }

  const otherUser = await User.findById(userId);
  if (!otherUser) {
    return res.status(404).json({ message: "User not found." });
  }

  let conversation = await Conversation.findOne({
    isGroup: false,
    participants: { $all: [req.user._id, userId], $size: 2 },
  });

  if (!conversation) {
    conversation = await Conversation.create({
      participants: [req.user._id, userId],
    });

    AuditLog.create({
      actorId: req.user._id,
      actorRole: req.user.role,
      action: "START_CONVERSATION",
      target: otherUser.email,
    }).catch((err) => console.error("[audit] failed to log conversation start:", err.message));
  }

  res.status(201).json({ conversation });
});

const createGroupSchema = z.object({
  name: z.string().trim().min(1, "Group name is required").max(80),
  participantIds: z.array(z.string()).min(1, "Add at least one other member"),
});

const createGroupConversation = asyncHandler(async (req, res) => {
  const { name, participantIds } = createGroupSchema.parse(req.body);

  const uniqueIds = Array.from(
    new Set(participantIds.filter((id) => id !== req.user._id.toString()))
  );
  if (uniqueIds.length === 0) {
    return res.status(400).json({ message: "Add at least one other member." });
  }

  const members = await User.find({ _id: { $in: uniqueIds } }).select("_id");
  if (members.length !== uniqueIds.length) {
    return res.status(400).json({ message: "One or more selected users don't exist." });
  }

  const conversation = await Conversation.create({
    participants: [req.user._id, ...uniqueIds],
    isGroup: true,
    name,
    createdBy: req.user._id,
  });

  const populated = await conversation.populate("participants", "name email avatar");

  AuditLog.create({
    actorId: req.user._id,
    actorRole: req.user.role,
    action: "CREATE_GROUP_CHAT",
    target: name,
  }).catch((err) => console.error("[audit] failed to log group creation:", err.message));

  uniqueIds.forEach((memberId) => {
    Notification.create({
      userId: memberId,
      type: "group_added",
      title: `You were added to "${name}"`,
      body: `${req.user.name} added you to a new group chat.`,
      link: "/chat",
    }).catch((err) => console.error("[notification] failed to create:", err.message));
  });

  res.status(201).json({ conversation: populated });
});

const getMessages = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;

  const conversation = await Conversation.findById(conversationId);
  if (!conversation) {
    return res.status(404).json({ message: "Conversation not found." });
  }
  const isMember = conversation.participants.some(
    (p) => p.toString() === req.user._id.toString()
  );
  if (!isMember) {
    return res.status(403).json({ message: "Access denied." });
  }

  const messages = await Message.find({ conversationId }).sort({ createdAt: 1 }).limit(300);

  if (conversation.isGroup) {
    await Message.updateMany(
      { conversationId, senderId: { $ne: req.user._id }, readBy: { $ne: req.user._id } },
      { $addToSet: { readBy: req.user._id } }
    );
  } else {
    await Message.updateMany(
      { conversationId, receiverId: req.user._id, read: false },
      { read: true }
    );
  }

  res.json({ messages });
});

// Accepts a base64 data URL and uploads it to Cloudinary as an "auto"
// resource (covers images, video, and audio), returning a URL the client
// attaches to a chat or meeting-chat message. Used for both file sharing
// and voice messages (a voice note is just an audio-type attachment).
const uploadChatFileSchema = z.object({
  fileBase64: z.string().min(1),
  fileName: z.string().max(200).optional(),
});

const uploadChatFile = asyncHandler(async (req, res) => {
  const { fileBase64, fileName } = uploadChatFileSchema.parse(req.body);

  let uploadResult;
  try {
    uploadResult = await cloudinary.uploader.upload(fileBase64, {
      folder: "streamly/chat",
      resource_type: "auto",
      // Without this, an unreachable/misconfigured Cloudinary account can
      // hang the request far longer than is useful — fail fast and visibly
      // instead of leaving the client spinning indefinitely.
      timeout: 20000,
    });
  } catch (err) {
    console.error("[chat upload] Cloudinary upload failed:", err.message || err);
    return res.status(502).json({
      message:
        "Could not upload the file — check that CLOUDINARY_CLOUD_NAME / CLOUDINARY_API_KEY / " +
        "CLOUDINARY_API_SECRET in backend/.env are set to real (not placeholder) values.",
    });
  }

  let type = "file";
  if (uploadResult.resource_type === "image") {
    type = "image";
  } else if (uploadResult.resource_type === "video") {
    // Cloudinary files both real videos and audio-only clips under
    // resource_type "video" — audio-only uploads have no width/height.
    type = uploadResult.width ? "video" : "audio";
  }

  res.status(201).json({
    url: uploadResult.secure_url,
    type,
    name: fileName || uploadResult.original_filename || "file",
    size: uploadResult.bytes || 0,
  });
});

// GET /chat/search?q=... — full-text-ish search across the user's own
// conversations only (never other people's messages).
const searchMessages = asyncHandler(async (req, res) => {
  const q = (req.query.q || "").toString().trim();
  if (!q) return res.json({ messages: [] });

  const myConversations = await Conversation.find({ participants: req.user._id }).select("_id");
  const conversationIds = myConversations.map((c) => c._id);

  const messages = await Message.find({
    conversationId: { $in: conversationIds },
    deleted: { $ne: true },
    content: { $regex: q, $options: "i" },
  })
    .sort({ createdAt: -1 })
    .limit(50)
    .populate("senderId", "name avatar");

  res.json({
    messages: messages.map((m) => ({
      _id: m._id,
      conversationId: m.conversationId,
      content: m.content,
      senderName: m.senderId?.name,
      senderAvatar: m.senderId?.avatar,
      createdAt: m.createdAt,
    })),
  });
});

// DELETE /chat/conversations/:conversationId — hides the conversation from
// this user's own inbox only (see the Conversation.hiddenFor comment).
// Works identically for 1:1 and group conversations.
const deleteConversation = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;

  const conversation = await Conversation.findById(conversationId);
  if (!conversation) {
    return res.status(404).json({ message: "Conversation not found." });
  }
  const isMember = conversation.participants.some(
    (p) => p.toString() === req.user._id.toString()
  );
  if (!isMember) {
    return res.status(403).json({ message: "Access denied." });
  }

  const existing = conversation.hiddenFor.find(
    (h) => h.userId.toString() === req.user._id.toString()
  );
  if (existing) {
    existing.hiddenAt = new Date();
  } else {
    conversation.hiddenFor.push({ userId: req.user._id, hiddenAt: new Date() });
  }
  await conversation.save();

  res.json({ message: "Conversation deleted." });
});

module.exports = {
  getConversations,
  startConversation,
  createGroupConversation,
  getMessages,
  uploadChatFile,
  searchMessages,
  deleteConversation,
};