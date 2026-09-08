const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema(
  {
    meetingId: { type: mongoose.Schema.Types.ObjectId, ref: "Meeting", required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    comment: { type: String, default: "", maxlength: 1000 },
  },
  { timestamps: true }
);

feedbackSchema.index({ meetingId: 1 });
// One feedback submission per user per meeting.
feedbackSchema.index({ meetingId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model("Feedback", feedbackSchema);