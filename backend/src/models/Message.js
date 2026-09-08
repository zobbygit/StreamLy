const mongoose = require("mongoose");

const attachmentSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    type: { type: String, enum: ["image", "video", "audio", "file"], required: true },
    name: { type: String, default: "" },
    size: { type: Number, default: 0 },
  },
  { _id: false }
);

const reactionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    emoji: { type: String, required: true },
  },
  { _id: false }
);

const messageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      default: null,
    },
    meetingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Meeting",
      default: null,
    },
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    // 1:1 conversations only — groups have multiple recipients, so they use
    // `readBy` below instead of a single receiver + read flag.
    receiverId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    content: { type: String, default: "", trim: true },
    attachments: { type: [attachmentSchema], default: [] },
    reactions: { type: [reactionSchema], default: [] },
    edited: { type: Boolean, default: false },
    deleted: { type: Boolean, default: false },
    read: { type: Boolean, default: false }, // 1:1 conversations
    readBy: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
      default: [],
    }, // group conversations
  },
  { timestamps: true }
);

messageSchema.index({ conversationId: 1, createdAt: 1 });
messageSchema.index({ meetingId: 1, createdAt: 1 });
messageSchema.index({ content: "text" });

module.exports = mongoose.model("Message", messageSchema);