const mongoose = require("mongoose");

const hiddenForSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    hiddenAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const conversationSchema = new mongoose.Schema(
  {
    participants: [
      { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    ],
    isGroup: { type: Boolean, default: false },
    name: { type: String, default: "" }, // group conversations only
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    lastMessage: { type: String, default: "" },
    lastMessageAt: { type: Date, default: Date.now },
    // "Delete conversation" is per-user and non-destructive: it just hides
    // the conversation from that user's list as of `hiddenAt`. It's not
    // deleted for the other participant(s), and it naturally reappears for
    // this user if a new message arrives afterward (lastMessageAt moves
    // past hiddenAt) — same behavior as most chat apps' "delete chat".
    hiddenFor: { type: [hiddenForSchema], default: [] },
  },
  { timestamps: true }
);

conversationSchema.index({ participants: 1 });

module.exports = mongoose.model("Conversation", conversationSchema);