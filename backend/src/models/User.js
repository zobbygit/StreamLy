const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    phone: { type: String, required: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    avatar: { type: String, default: "" },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    accountStatus: {
      type: String,
      enum: ["active", "deactivated", "deleted"],
      default: "active",
    },
    monthlyMeetingsCreated: { type: Number, default: 0 },
    monthlyMeetingsResetAt: { type: Date, default: Date.now },
    lastSeen: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
