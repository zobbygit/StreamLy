const mongoose = require("mongoose");

const meetingParticipantSchema = new mongoose.Schema(
  {
    meetingId: { type: mongoose.Schema.Types.ObjectId, ref: "Meeting", required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    role: { type: String, enum: ["host", "participant"], default: "participant" },
    joinedAt: { type: Date, default: Date.now },
    leftAt: { type: Date, default: null },
  },
  { timestamps: true }
);

meetingParticipantSchema.index({ meetingId: 1, userId: 1 });

module.exports = mongoose.model("MeetingParticipant", meetingParticipantSchema);
