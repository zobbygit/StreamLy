const { z } = require("zod");
const argon2 = require("argon2");
const crypto = require("crypto");
const asyncHandler = require("../utils/asyncHandler");
const cloudinary = require("../config/cloudinary");
const { sanitizeUser } = require("./authController");
const { clearAuthCookie } = require("../utils/jwt");
const User = require("../models/User");
const Meeting = require("../models/Meeting");
const Message = require("../models/Message");
const Conversation = require("../models/Conversation");
const Feedback = require("../models/Feedback");

const getProfile = asyncHandler(async (req, res) => {
  res.json({ user: sanitizeUser(req.user) });
});

const updateAvatarSchema = z.object({
  imageBase64: z.string().min(1, "Image data is required"),
});

// Accepts a base64 data URL from the client, uploads it to Cloudinary,
// and stores the resulting secure URL on the user document.
const updateAvatar = asyncHandler(async (req, res) => {
  const { imageBase64 } = updateAvatarSchema.parse(req.body);

  const uploadResult = await cloudinary.uploader.upload(imageBase64, {
    folder: "streamly/avatars",
    public_id: `user_${req.user._id}`,
    overwrite: true,
    transformation: [{ width: 400, height: 400, crop: "fill", gravity: "face" }],
  });

  req.user.avatar = uploadResult.secure_url;
  await req.user.save();

  res.json({ user: sanitizeUser(req.user) });
});

const searchUsers = asyncHandler(async (req, res) => {
  const q = (req.query.email || "").toString().trim().toLowerCase();
  if (!q) return res.json({ users: [] });

  const users = await User.find({
    email: { $regex: q, $options: "i" },
    _id: { $ne: req.user._id },
    accountStatus: "active",
  })
    .select("name email avatar lastSeen")
    .limit(10);

  res.json({ users });
});

// GET /users/me/export — a personal data export (GDPR-style "download your
// data"). Only ever includes the requesting user's OWN messages/content,
// never other participants' private messages.
const exportMyData = asyncHandler(async (req, res) => {
  const [hostedMeetings, joinedMeetings, myMessages, myConversations, myFeedback] =
    await Promise.all([
      Meeting.find({ hostId: req.user._id }).select(
        "meetingId title status startedAt endedAt durationMinutes"
      ),
      Meeting.find({ participants: req.user._id, hostId: { $ne: req.user._id } }).select(
        "meetingId title status startedAt endedAt"
      ),
      Message.find({ senderId: req.user._id, deleted: { $ne: true } }).select(
        "conversationId meetingId content attachments createdAt"
      ),
      Conversation.find({ participants: req.user._id }).select(
        "isGroup name participants createdAt"
      ),
      Feedback.find({ userId: req.user._id }).select("meetingId rating comment createdAt"),
    ]);

  const exportPayload = {
    exportedAt: new Date().toISOString(),
    profile: sanitizeUser(req.user),
    meetingsHosted: hostedMeetings,
    meetingsJoined: joinedMeetings,
    conversations: myConversations,
    messagesSent: myMessages,
    feedbackSubmitted: myFeedback,
  };

  res.setHeader("Content-Disposition", 'attachment; filename="streamly-data-export.json"');
  res.setHeader("Content-Type", "application/json");
  res.status(200).send(JSON.stringify(exportPayload, null, 2));
});

const deleteAccountSchema = z.object({
  password: z.string().min(1, "Password is required to confirm account deletion."),
});

// DELETE /users/me — a "soft" delete: anonymizes personally identifying
// fields and marks the account deleted, rather than removing the User
// document outright. This preserves referential integrity for other
// people's meeting/chat history (their records still show *someone* was
// there) without keeping this user's identifying information around.
const deleteMyAccount = asyncHandler(async (req, res) => {
  const { password } = deleteAccountSchema.parse(req.body);

  const user = await User.findById(req.user._id).select("+passwordHash");
  const valid = await argon2.verify(user.passwordHash, password);
  if (!valid) {
    return res.status(401).json({ message: "Incorrect password." });
  }

  const randomSuffix = crypto.randomBytes(8).toString("hex");
  user.name = "Deleted User";
  user.email = `deleted-${randomSuffix}@streamly.invalid`;
  user.phone = "";
  user.avatar = "";
  user.passwordHash = await argon2.hash(crypto.randomBytes(32).toString("hex"));
  user.accountStatus = "deleted";
  await user.save();

  clearAuthCookie(res);
  res.json({ message: "Your account has been deleted." });
});

module.exports = {
  getProfile,
  updateAvatar,
  searchUsers,
  exportMyData,
  deleteMyAccount,
};