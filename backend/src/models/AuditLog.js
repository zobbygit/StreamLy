const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema(
  {
    // The user who performed the action. Kept generic (not admin-only) so we
    // can log everyday activity (logins, meeting creation, chat starts) as
    // well as admin moderation actions in one unified trail.
    actorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    actorRole: { type: String, enum: ["user", "admin"], required: true },
    action: { type: String, required: true },
    target: { type: String, default: "" },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true },
);

auditLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model("AuditLog", auditLogSchema);
