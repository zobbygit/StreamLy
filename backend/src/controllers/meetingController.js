const { z } = require("zod");
const Meeting = require("../models/Meeting");
const MeetingParticipant = require("../models/MeetingParticipant");
const Feedback = require("../models/Feedback");
const Message = require("../models/Message");
const User = require("../models/User");
const AuditLog = require("../models/AuditLog");
const asyncHandler = require("../utils/asyncHandler");
const generateMeetingId = require("../utils/meetingId");

// Ensures the monthly meeting counter resets when a new calendar month begins.
async function maybeResetMonthlyCounter(user) {
  const now = new Date();
  const resetAt = user.monthlyMeetingsResetAt || new Date(0);
  if (now.getMonth() !== resetAt.getMonth() || now.getFullYear() !== resetAt.getFullYear()) {
    user.monthlyMeetingsCreated = 0;
    user.monthlyMeetingsResetAt = now;
  }
}

async function generateUniqueMeetingId() {
  for (let attempts = 0; attempts < 5; attempts++) {
    const candidate = generateMeetingId();
    // eslint-disable-next-line no-await-in-loop
    const exists = await Meeting.findOne({ meetingId: candidate });
    if (!exists) return candidate;
  }
  return null;
}

const createMeetingSchema = z.object({
  title: z.string().trim().max(120).optional(),
});

const createMeeting = asyncHandler(async (req, res) => {
  const { title } = createMeetingSchema.parse(req.body || {});

  const meetingId = await generateUniqueMeetingId();
  if (!meetingId) {
    return res.status(500).json({ message: "Could not generate a unique meeting ID. Try again." });
  }

  const meeting = await Meeting.create({
    meetingId,
    title: title || "Instant Meeting",
    hostId: req.user._id,
    participants: [req.user._id],
  });

  await MeetingParticipant.create({
    meetingId: meeting._id,
    userId: req.user._id,
    role: "host",
  });

  await maybeResetMonthlyCounter(req.user);
  req.user.monthlyMeetingsCreated += 1;
  await req.user.save();

  AuditLog.create({
    actorId: req.user._id,
    actorRole: req.user.role,
    action: "CREATE_MEETING",
    target: meeting.meetingId,
  }).catch((err) => console.error("[audit] failed to log meeting creation:", err.message));

  res.status(201).json({ meeting });
});

// ---------------------------------------------------------------------------
// Scheduled meetings
// ---------------------------------------------------------------------------

const scheduleMeetingSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(120),
  description: z.string().trim().max(1000).optional(),
  // Client sends a full ISO 8601 datetime string (e.g. from
  // `new Date(localDate).toISOString()`), which already encodes the
  // absolute UTC instant — so this is timezone-safe no matter where the
  // host or any participant is located; we never parse a bare "date + time"
  // pair ourselves, which is what would introduce timezone bugs.
  scheduledFor: z.string().datetime({ message: "Invalid date/time." }),
  durationMinutes: z.number().int().min(5).max(600).optional(),
});

const scheduleMeeting = asyncHandler(async (req, res) => {
  const data = scheduleMeetingSchema.parse(req.body);

  const scheduledFor = new Date(data.scheduledFor);
  if (scheduledFor.getTime() <= Date.now()) {
    return res.status(400).json({ message: "Scheduled time must be in the future." });
  }

  const meetingId = await generateUniqueMeetingId();
  if (!meetingId) {
    return res.status(500).json({ message: "Could not generate a unique meeting ID. Try again." });
  }

  const meeting = await Meeting.create({
    meetingId,
    title: data.title,
    description: data.description || "",
    hostId: req.user._id,
    participants: [req.user._id],
    status: "scheduled",
    scheduledFor,
    durationMinutes: data.durationMinutes || null,
  });

  res.status(201).json({ meeting });
});

// GET /meetings/scheduled — meetings the user is hosting or invited to that
// are still upcoming (scheduled) or were cancelled, most recent first.
const getScheduledMeetings = asyncHandler(async (req, res) => {
  const meetings = await Meeting.find({
    participants: req.user._id,
    status: { $in: ["scheduled", "cancelled"] },
  })
    .sort({ scheduledFor: 1 })
    .populate("hostId", "name email");

  res.json({
    meetings: meetings.map((m) => ({
      meetingId: m.meetingId,
      title: m.title,
      description: m.description,
      status: m.status,
      scheduledFor: m.scheduledFor,
      durationMinutes: m.durationMinutes,
      host: m.hostId ? { name: m.hostId.name, email: m.hostId.email } : null,
      isHost: m.hostId && m.hostId._id.toString() === req.user._id.toString(),
      participantCount: m.participants.length,
    })),
  });
});

const updateScheduledMeetingSchema = z.object({
  title: z.string().trim().min(1).max(120).optional(),
  description: z.string().trim().max(1000).optional(),
  scheduledFor: z.string().datetime().optional(),
  durationMinutes: z.number().int().min(5).max(600).optional(),
});

const updateScheduledMeeting = asyncHandler(async (req, res) => {
  const data = updateScheduledMeetingSchema.parse(req.body);

  const meeting = await Meeting.findOne({ meetingId: req.params.meetingId });
  if (!meeting) return res.status(404).json({ message: "Meeting not found." });

  if (meeting.hostId.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: "Only the host can edit this meeting." });
  }
  if (meeting.status !== "scheduled") {
    return res.status(400).json({ message: "Only meetings that haven't started yet can be edited." });
  }

  if (data.title !== undefined) meeting.title = data.title;
  if (data.description !== undefined) meeting.description = data.description;
  if (data.durationMinutes !== undefined) meeting.durationMinutes = data.durationMinutes;
  if (data.scheduledFor !== undefined) {
    const next = new Date(data.scheduledFor);
    if (next.getTime() <= Date.now()) {
      return res.status(400).json({ message: "Scheduled time must be in the future." });
    }
    meeting.scheduledFor = next;
  }

  await meeting.save();
  res.json({ meeting });
});

const cancelScheduledMeeting = asyncHandler(async (req, res) => {
  const meeting = await Meeting.findOne({ meetingId: req.params.meetingId });
  if (!meeting) return res.status(404).json({ message: "Meeting not found." });

  if (meeting.hostId.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: "Only the host can cancel this meeting." });
  }
  if (meeting.status !== "scheduled") {
    return res.status(400).json({ message: "Only upcoming meetings can be cancelled." });
  }

  meeting.status = "cancelled";
  await meeting.save();

  res.json({ meeting });
});

const joinMeetingSchema = z.object({
  meetingId: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z]{3}-[a-z]{3}-[a-z]{3}$/, "Enter a valid meeting code, e.g. abc-def-ghi"),
});

const joinMeeting = asyncHandler(async (req, res) => {
  const { meetingId } = joinMeetingSchema.parse(req.body);

  const meeting = await Meeting.findOne({ meetingId });
  if (!meeting) {
    return res.status(404).json({ message: "No meeting found with that code." });
  }
  if (meeting.status === "ended") {
    return res.status(410).json({ message: "This meeting has ended." });
  }
  if (meeting.status === "cancelled") {
    return res.status(410).json({ message: "This meeting was cancelled." });
  }

  // A scheduled meeting goes live the moment the first person joins it.
  if (meeting.status === "scheduled") {
    meeting.status = "active";
    meeting.startedAt = new Date();
  }

  const alreadyIn = meeting.participants.some(
    (p) => p.toString() === req.user._id.toString()
  );
  if (!alreadyIn) {
    meeting.participants.push(req.user._id);
  }
  await meeting.save();

  const existingRecord = await MeetingParticipant.findOne({
    meetingId: meeting._id,
    userId: req.user._id,
    leftAt: null,
  });
  if (!existingRecord) {
    await MeetingParticipant.create({
      meetingId: meeting._id,
      userId: req.user._id,
      role: meeting.hostId.toString() === req.user._id.toString() ? "host" : "participant",
    });
  }

  res.json({ meeting });
});

const getMeeting = asyncHandler(async (req, res) => {
  const meeting = await Meeting.findOne({ meetingId: req.params.meetingId }).populate(
    "hostId",
    "name email avatar"
  );
  if (!meeting) {
    return res.status(404).json({ message: "Meeting not found." });
  }

  // The meeting code itself is the access credential (same model as a Zoom/
  // Meet link) — anyone with a valid, active code can view/join. For an
  // ENDED meeting, though, only people who were actually part of it (or an
  // admin) should be able to pull up its details from Sessions.
  const isParticipant = meeting.participants.some(
    (p) => p.toString() === req.user._id.toString()
  );
  if (meeting.status === "ended" && !isParticipant && req.user.role !== "admin") {
    return res.status(403).json({ message: "You don't have access to this meeting." });
  }

  const participants = await User.find({ _id: { $in: meeting.participants } }).select(
    "name email avatar"
  );

  const durationMs = meeting.endedAt
    ? new Date(meeting.endedAt) - new Date(meeting.startedAt)
    : Date.now() - new Date(meeting.startedAt).getTime();

  res.json({ meeting, participants, durationMs });
});

const endMeeting = asyncHandler(async (req, res) => {
  const meeting = await Meeting.findOne({ meetingId: req.params.meetingId });
  if (!meeting) {
    return res.status(404).json({ message: "Meeting not found." });
  }
  if (meeting.hostId.toString() !== req.user._id.toString() && req.user.role !== "admin") {
    return res.status(403).json({ message: "Only the host can end this meeting." });
  }

  meeting.status = "ended";
  meeting.endedAt = new Date();
  await meeting.save();

  await MeetingParticipant.updateMany(
    { meetingId: meeting._id, leftAt: null },
    { leftAt: new Date() }
  );

  AuditLog.create({
    actorId: req.user._id,
    actorRole: req.user.role,
    action: "END_MEETING",
    target: meeting.meetingId,
  }).catch((err) => console.error("[audit] failed to log meeting end:", err.message));

  res.json({ message: "Meeting ended.", meeting });
});

const leaveMeeting = asyncHandler(async (req, res) => {
  const meeting = await Meeting.findOne({ meetingId: req.params.meetingId });
  if (!meeting) {
    return res.status(404).json({ message: "Meeting not found." });
  }

  await MeetingParticipant.updateMany(
    { meetingId: meeting._id, userId: req.user._id, leftAt: null },
    { leftAt: new Date() }
  );

  res.json({ message: "Left meeting." });
});

// GET /sessions — meeting history for the logged-in user (as host or participant).
// Scheduled/cancelled meetings live on the Schedule page instead.
const getSessions = asyncHandler(async (req, res) => {
  const meetings = await Meeting.find({
    participants: req.user._id,
    status: { $in: ["active", "ended"] },
  })
    .sort({ createdAt: -1 })
    .limit(50)
    .populate("hostId", "name email");

  const results = await Promise.all(
    meetings.map(async (m) => ({
      meetingId: m.meetingId,
      title: m.title,
      status: m.status,
      host: m.hostId ? { name: m.hostId.name, email: m.hostId.email } : null,
      participantCount: m.participants.length,
      messageCount: m.messageCount,
      startedAt: m.startedAt,
      endedAt: m.endedAt,
      isHost: m.hostId && m.hostId._id.toString() === req.user._id.toString(),
    }))
  );

  res.json({ sessions: results });
});

const submitFeedbackSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().max(1000).optional(),
});

// POST /meetings/:meetingId/feedback — one submission per user per meeting
// (enforced by a unique index on the Feedback model), so resubmitting just
// updates the existing rating rather than erroring.
const submitFeedback = asyncHandler(async (req, res) => {
  const { rating, comment } = submitFeedbackSchema.parse(req.body);

  const meeting = await Meeting.findOne({ meetingId: req.params.meetingId });
  if (!meeting) {
    return res.status(404).json({ message: "Meeting not found." });
  }
  const isParticipant = meeting.participants.some(
    (p) => p.toString() === req.user._id.toString()
  );
  if (!isParticipant) {
    return res.status(403).json({ message: "You weren't part of this meeting." });
  }

  const feedback = await Feedback.findOneAndUpdate(
    { meetingId: meeting._id, userId: req.user._id },
    { rating, comment: comment || "" },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  res.status(201).json({ feedback });
});

module.exports = {
  createMeeting,
  scheduleMeeting,
  getScheduledMeetings,
  updateScheduledMeeting,
  cancelScheduledMeeting,
  joinMeeting,
  getMeeting,
  endMeeting,
  leaveMeeting,
  getSessions,
  submitFeedback,
};