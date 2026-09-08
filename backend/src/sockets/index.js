const cookie = require("cookie");
const { verifyToken } = require("../utils/jwt");
const User = require("../models/User");
const Meeting = require("../models/Meeting");
const Message = require("../models/Message");
const Conversation = require("../models/Conversation");
const Notification = require("../models/Notification");

// Tracks which socket ids are currently sitting in which meeting room, so we
// can broadcast an accurate participant list and clean up on disconnect.
const meetingPresence = new Map(); // meetingId(string) -> Map<socketId, userInfo>
const onlineUsers = new Map(); // userId(string) -> Set<socketId>
// Tracks users the host has removed from a given meeting, so a kicked user
// can't just rejoin (from the same tab or a new one) to get back in. Cleared
// when the meeting ends.
const kickedFromMeeting = new Map(); // meetingId(string) -> Set<userId>

function initSockets(io) {
  io.use(async (socket, next) => {
    try {
      const cookieHeader = socket.handshake.headers.cookie;
      if (!cookieHeader) return next(new Error("Unauthorized"));
      const cookieName = process.env.COOKIE_NAME || "streamly_token";
      const parsed = cookie.parse(cookieHeader);
      const token = parsed[cookieName];
      if (!token) return next(new Error("Unauthorized"));

      const decoded = verifyToken(token);
      const user = await User.findById(decoded.sub);
           if (!user || user.accountStatus === "deactivated" || user.accountStatus === "deleted") {
        return next(new Error("Unauthorized"));
      }
      socket.user = {
        id: user._id.toString(),
        name: user.name,
        avatar: user.avatar,
      };
      next();
    } catch (err) {
      next(new Error("Unauthorized"));
    }
  });

  // Server-side source of truth for "is this socket currently the host of
  // this meeting". isHost is computed from the DB at join time (never taken
  // from anything the client sends), so host-only actions below can trust it.
  function isSocketHost(meetingId, socketId) {
    const room = meetingPresence.get(meetingId);
    const info = room && room.get(socketId);
    return Boolean(info && info.isHost);
  }

  io.on("connection", (socket) => {
    const userId = socket.user.id;

    // ---- Presence (general online/offline status for chat) ----
    if (!onlineUsers.has(userId)) onlineUsers.set(userId, new Set());
    onlineUsers.get(userId).add(socket.id);
    io.emit("presence:update", { userId, online: true });

    // ---- General chat (1:1) ----
    socket.on("chat:join", ({ conversationId }) => {
      socket.join(`conv:${conversationId}`);
    });

    socket.on("chat:message", async ({ conversationId, receiverId, content, attachments }, ack) => {
      const trimmed = (content || "").trim();
      const hasAttachments = Array.isArray(attachments) && attachments.length > 0;
      if (!trimmed && !hasAttachments) {
        if (typeof ack === "function") ack({ success: false, message: "Empty message." });
        return;
      }

      try {
        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
          console.error("[chat:message] conversation not found:", conversationId);
          if (typeof ack === "function") ack({ success: false, message: "Conversation not found." });
          return;
        }
        const isMember = conversation.participants.some((p) => p.toString() === userId);
        if (!isMember) {
          console.error("[chat:message] sender is not a member of conversation:", conversationId, userId);
          if (typeof ack === "function") ack({ success: false, message: "You are not a member of this conversation." });
          return;
        }

        const message = await Message.create({
          conversationId,
          senderId: userId,
          receiverId: conversation.isGroup ? null : receiverId,
          content: trimmed,
          attachments: hasAttachments ? attachments : [],
          // The sender has implicitly "read" their own message in a group.
          readBy: conversation.isGroup ? [userId] : [],
        });

        await Conversation.findByIdAndUpdate(conversationId, {
          lastMessage: trimmed || (hasAttachments ? "📎 Attachment" : ""),
          lastMessageAt: new Date(),
        });

          io.to(`conv:${conversationId}`).emit("chat:message", message);

        // Notify every OTHER participant's other sockets (e.g. for unread
        // badges) even if they haven't joined this conversation room yet.
        // Works for both 1:1 and group conversations.
        const preview = trimmed || (hasAttachments ? "Sent an attachment" : "");
        conversation.participants.forEach((pid) => {
          const pidStr = pid.toString();
          if (pidStr === userId) return;
          const sockets = onlineUsers.get(pidStr);
          if (sockets) {
            sockets.forEach((sid) => {
              io.to(sid).emit("chat:notification", { conversationId, message });
            });
          }

          // Persisted notification-center entry, separate from the chat
          // unread badge above — this is what powers the notification bell.
          Notification.create({
            userId: pid,
            type: "message",
            title: `New message from ${socket.user.name}`,
            body: preview.slice(0, 140),
            link: "/chat",
          })
            .then((notif) => {
              if (sockets) {
                sockets.forEach((sid) => io.to(sid).emit("notification:new", notif));
              }
            })
            .catch((err) => console.error("[notification] failed to create:", err.message));
        });

        if (typeof ack === "function") ack({ success: true, messageId: message._id });
      } catch (err) {
        console.error("[chat:message] failed:", err.message);
        socket.emit("error:chat", { message: "Failed to send message." });
        if (typeof ack === "function") ack({ success: false, message: err.message || "Failed to send message." });
      }
    });

    // Ephemeral — not persisted, just relayed to whoever else is currently
    // viewing the conversation.
    socket.on("chat:typing", ({ conversationId, isTyping }) => {
      socket.to(`conv:${conversationId}`).emit("chat:typing", {
        conversationId,
        userId,
        isTyping: Boolean(isTyping),
      });
    });

    // Toggling the same emoji again removes your reaction (like most chat apps).
    socket.on("chat:react", async ({ messageId, emoji }, ack) => {
      if (!emoji) {
        if (typeof ack === "function") ack({ success: false, message: "No emoji provided." });
        return;
      }
      try {
        const message = await Message.findById(messageId);
        if (!message || !message.conversationId) {
          console.error("[chat:react] message not found or has no conversationId:", messageId);
          if (typeof ack === "function") ack({ success: false, message: "Message not found." });
          return;
        }

        const existingIndex = message.reactions.findIndex(
          (r) => r.userId.toString() === userId && r.emoji === emoji
        );
        if (existingIndex >= 0) {
          message.reactions.splice(existingIndex, 1);
        } else {
          message.reactions.push({ userId, emoji });
        }
        await message.save();

        io.to(`conv:${message.conversationId}`).emit("chat:reaction-update", {
          messageId: message._id,
          reactions: message.reactions,
        });
        if (typeof ack === "function") ack({ success: true });
      } catch (err) {
        console.error("[chat:react] failed:", err.message);
        if (typeof ack === "function") ack({ success: false, message: err.message || "Failed to react." });
      }
    });

    // Only the original sender may edit/delete — enforced here server-side,
    // not just by hiding the buttons in the UI.
    socket.on("chat:edit-message", async ({ messageId, content }, ack) => {
      const trimmed = (content || "").trim();
      if (!trimmed) {
        if (typeof ack === "function") ack({ success: false, message: "Message can't be empty." });
        return;
      }
      try {
        const message = await Message.findById(messageId);
        if (!message) {
          console.error("[chat:edit-message] message not found:", messageId);
          if (typeof ack === "function") ack({ success: false, message: "Message not found." });
          return;
        }
        if (message.senderId.toString() !== userId || message.deleted) {
          console.error("[chat:edit-message] blocked — not sender or message deleted:", messageId, userId);
          if (typeof ack === "function") ack({ success: false, message: "You can only edit your own messages." });
          return;
        }

        message.content = trimmed;
        message.edited = true;
        await message.save();

        io.to(`conv:${message.conversationId}`).emit("chat:message-updated", {
          messageId: message._id,
          content: message.content,
          edited: true,
        });
        if (typeof ack === "function") ack({ success: true });
      } catch (err) {
        console.error("[chat:edit-message] failed:", err.message);
        if (typeof ack === "function") ack({ success: false, message: err.message || "Failed to edit message." });
      }
    });

    socket.on("chat:delete-message", async ({ messageId }, ack) => {
      try {
        const message = await Message.findById(messageId);
        if (!message) {
          console.error("[chat:delete-message] message not found:", messageId);
          if (typeof ack === "function") ack({ success: false, message: "Message not found." });
          return;
        }
        if (message.senderId.toString() !== userId) {
          console.error("[chat:delete-message] blocked — not sender:", messageId, userId);
          if (typeof ack === "function") ack({ success: false, message: "You can only delete your own messages." });
          return;
        }

        message.deleted = true;
        message.content = "";
        message.attachments = [];
        await message.save();

        io.to(`conv:${message.conversationId}`).emit("chat:message-deleted", {
          messageId: message._id,
        });
        if (typeof ack === "function") ack({ success: true });
      } catch (err) {
        console.error("[chat:delete-message] failed:", err.message);
        if (typeof ack === "function") ack({ success: false, message: err.message || "Failed to delete message." });
      }
    });

    // ---- Meeting room: WebRTC signaling + in-meeting chat + participant state ----
    socket.on("meeting:join", async ({ meetingId, mediaState }) => {
      try {
        const meeting = await Meeting.findOne({ meetingId });
        if (!meeting || meeting.status !== "active") {
          socket.emit("meeting:error", { message: "Meeting not found or has ended." });
          return;
        }

        const kicked = kickedFromMeeting.get(meetingId);
        if (kicked && kicked.has(userId)) {
          socket.emit("meeting:error", {
            message: "You have been removed from this meeting by the host.",
          });
          return;
        }

        socket.data.meetingId = meetingId;
        socket.join(`meeting:${meetingId}`);

        if (!meetingPresence.has(meetingId)) meetingPresence.set(meetingId, new Map());
        const room = meetingPresence.get(meetingId);

        // Tell the newly joined socket about everyone already in the room
        const existingPeers = Array.from(room.entries()).map(([sid, info]) => ({
          socketId: sid,
          ...info,
        }));
        socket.emit("meeting:existing-peers", existingPeers);

        room.set(socket.id, {
          userId,
          name: socket.user.name,
          avatar: socket.user.avatar,
          isHost: meeting.hostId.toString() === userId,
          micOn: mediaState?.micOn ?? true,
          cameraOn: mediaState?.cameraOn ?? true,
          handRaised: false,
        });

        socket.to(`meeting:${meetingId}`).emit("meeting:peer-joined", {
          socketId: socket.id,
          userId,
          name: socket.user.name,
          avatar: socket.user.avatar,
          isHost: meeting.hostId.toString() === userId,
          micOn: mediaState?.micOn ?? true,
          cameraOn: mediaState?.cameraOn ?? true,
        });

        // Let the joining client know the authoritative server-side start
        // time so all participants' elapsed-time timers stay in sync,
        // regardless of each device's own clock.
        socket.emit("meeting:timer-sync", { startedAt: meeting.startedAt });
      } catch (err) {
        socket.emit("meeting:error", { message: "Failed to join meeting room." });
      }
    });

    // WebRTC signaling relay (mesh topology — fine for small meetings; swap
    // for an SFU such as LiveKit/mediasoup when scaling to larger rooms).
    socket.on("meeting:signal", ({ to, signal }) => {
      io.to(to).emit("meeting:signal", { from: socket.id, signal });
    });

    socket.on("meeting:media-state", ({ meetingId, micOn, cameraOn }) => {
      const room = meetingPresence.get(meetingId);
      if (room && room.has(socket.id)) {
        const info = room.get(socket.id);
        if (typeof micOn === "boolean") info.micOn = micOn;
        if (typeof cameraOn === "boolean") info.cameraOn = cameraOn;
      }
      socket.to(`meeting:${meetingId}`).emit("meeting:media-state", {
        socketId: socket.id,
        micOn,
        cameraOn,
      });
    });

    // Ephemeral quick reaction (👍❤️😂 etc.) — not persisted, just broadcast
    // to everyone in the room including the sender, so the client can show
    // a brief floating animation over that participant's tile.
    socket.on("meeting:reaction", ({ meetingId, emoji }) => {
      if (!emoji || !meetingId) return;
      io.to(`meeting:${meetingId}`).emit("meeting:reaction", {
        socketId: socket.id,
        name: socket.user.name,
        emoji,
      });
    });

    // Raise/lower hand — persisted in the room presence map so it survives
    // for anyone who joins later and is included in "meeting:existing-peers".
    socket.on("meeting:hand-raise", ({ meetingId, raised }) => {
      const room = meetingPresence.get(meetingId);
      if (room && room.has(socket.id)) {
        room.get(socket.id).handRaised = Boolean(raised);
      }
      io.to(`meeting:${meetingId}`).emit("meeting:hand-raise", {
        socketId: socket.id,
        raised: Boolean(raised),
      });
    });

    socket.on("meeting:chat", async ({ meetingId, content, attachments }) => {
      const trimmed = (content || "").trim();
      const hasAttachments = Array.isArray(attachments) && attachments.length > 0;
      if (!trimmed && !hasAttachments) return;
      try {
        const meeting = await Meeting.findOne({ meetingId });
        if (!meeting) return;

        const message = await Message.create({
          meetingId: meeting._id,
          senderId: userId,
          content: trimmed,
          attachments: hasAttachments ? attachments : [],
        });
        meeting.messageCount += 1;
        await meeting.save();

        io.to(`meeting:${meetingId}`).emit("meeting:chat", {
          _id: message._id,
          senderId: userId,
          senderName: socket.user.name,
          content: message.content,
          attachments: message.attachments,
          createdAt: message.createdAt,
        });
      } catch (err) {
        socket.emit("error:chat", { message: "Failed to send message." });
      }
    });

    // ---- Host controls (all verified server-side via isSocketHost — the
    // React UI only ever hides buttons for non-hosts, it never enforces
    // anything by itself) ----
    socket.on("meeting:mute-all", ({ meetingId }) => {
      if (!isSocketHost(meetingId, socket.id)) return;
      const room = meetingPresence.get(meetingId);
      if (room) {
        room.forEach((info, sid) => {
          if (sid !== socket.id) info.micOn = false;
        });
      }
      socket.to(`meeting:${meetingId}`).emit("meeting:force-mute");
    });

    socket.on("meeting:camera-off-all", ({ meetingId }) => {
      if (!isSocketHost(meetingId, socket.id)) return;
      const room = meetingPresence.get(meetingId);
      if (room) {
        room.forEach((info, sid) => {
          if (sid !== socket.id) info.cameraOn = false;
        });
      }
      socket.to(`meeting:${meetingId}`).emit("meeting:force-camera-off");
    });

    socket.on("meeting:remove-participant", ({ meetingId, targetSocketId }) => {
      if (!isSocketHost(meetingId, socket.id)) return;
      if (targetSocketId === socket.id) return; // can't remove yourself this way

      const room = meetingPresence.get(meetingId);
      const targetInfo = room && room.get(targetSocketId);
      if (!targetInfo) return;

      if (!kickedFromMeeting.has(meetingId)) kickedFromMeeting.set(meetingId, new Set());
      kickedFromMeeting.get(meetingId).add(targetInfo.userId);


      const targetSocket = io.sockets.sockets.get(targetSocketId);
      if (targetSocket) {
        targetSocket.emit("meeting:removed", {
          message: "You were removed from the meeting by the host.",
        });
        leaveMeetingRoom(targetSocket, meetingId);
        targetSocket.data.meetingId = null;
      }

      Notification.create({
        userId: targetInfo.userId,
        type: "meeting_removed",
        title: "Removed from meeting",
        body: `${socket.user.name} removed you from a meeting.`,
        link: "/sessions",
      }).catch((err) => console.error("[notification] failed to create:", err.message));
    });



    // ---- Optional host-controlled countdown timer ----
    socket.on("meeting:start-countdown", ({ meetingId, minutes }) => {
      if (!isSocketHost(meetingId, socket.id)) return;
      const mins = Number(minutes);
      if (!mins || mins <= 0 || mins > 600) return;
      const endsAt = Date.now() + mins * 60000;
      io.to(`meeting:${meetingId}`).emit("meeting:countdown", { endsAt });
    });

    socket.on("meeting:cancel-countdown", ({ meetingId }) => {
      if (!isSocketHost(meetingId, socket.id)) return;
      io.to(`meeting:${meetingId}`).emit("meeting:countdown", { endsAt: null });
    });

    socket.on("meeting:leave", ({ meetingId }) => {
      leaveMeetingRoom(socket, meetingId);
    });

    socket.on("meeting:ended", ({ meetingId }) => {
      io.to(`meeting:${meetingId}`).emit("meeting:ended");
      const room = meetingPresence.get(meetingId);
      if (room) {
        room.clear();
        meetingPresence.delete(meetingId);
      }
      kickedFromMeeting.delete(meetingId);
    });

    socket.on("disconnect", () => {
      const meetingId = socket.data.meetingId;
      if (meetingId) leaveMeetingRoom(socket, meetingId);

      const sockets = onlineUsers.get(userId);
      if (sockets) {
        sockets.delete(socket.id);
        if (sockets.size === 0) {
          onlineUsers.delete(userId);
          io.emit("presence:update", { userId, online: false });
        }
      }
    });

    function leaveMeetingRoom(sock, meetingId) {
      const room = meetingPresence.get(meetingId);
      if (room) {
        room.delete(sock.id);
        if (room.size === 0) meetingPresence.delete(meetingId);
      }
      sock.leave(`meeting:${meetingId}`);
      sock.to(`meeting:${meetingId}`).emit("meeting:peer-left", { socketId: sock.id });
    }
  });
}

module.exports = initSockets;