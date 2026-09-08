const mongoose = require("mongoose");

const meetingSchema = new mongoose.Schema(
  {
    meetingId: { type: String, required: true, unique: true, index: true },
    title: { type: String, default: "Instant Meeting" },
    description: { type: String, default: "" },
    hostId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    // scheduled: created for a future time, not yet started.
    // active: currently in progress (instant meetings start here directly).
    // ended: finished normally.
    // cancelled: a scheduled meeting the host cancelled before it started.
    status: {
      type: String,
      enum: ["scheduled", "active", "ended", "cancelled"],
      default: "active",
    },
    participants: [
      { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    ],
    messageCount: { type: Number, default: 0 },
    // For scheduled meetings: the planned start time (stored as an absolute
    // UTC instant — the client sends an ISO string, Mongo/JS Date handles the
    // UTC conversion, so this is timezone-safe regardless of where the host
    // or any participant is physically located).
    scheduledFor: { type: Date, default: null },
    // Planned length in minutes, used for display and for the optional
    // host-controlled countdown.
    durationMinutes: { type: Number, default: null },
    startedAt: { type: Date, default: Date.now },
    endedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

meetingSchema.index({ scheduledFor: 1 });

module.exports = mongoose.model("Meeting", meetingSchema);