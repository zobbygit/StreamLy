const { z } = require("zod");
const argon2 = require("argon2");
const User = require("../models/User");
const Meeting = require("../models/Meeting");
const Message = require("../models/Message");
const Conversation = require("../models/Conversation");
const AuditLog = require("../models/AuditLog");
const Feedback = require("../models/Feedback");
const asyncHandler = require("../utils/asyncHandler");
const { signToken, setAuthCookie, clearAuthCookie } = require("../utils/jwt");
const { sanitizeUser } = require("./authController");

const adminLoginSchema = z.object({
  email: z.string().trim().email().toLowerCase(),
  password: z.string().min(1),
});

const adminLogin = asyncHandler(async (req, res) => {
  const { email, password } = adminLoginSchema.parse(req.body);

  const admin = await User.findOne({ email, role: "admin" }).select("+passwordHash");
  if (!admin) {
    return res.status(401).json({ message: "Invalid admin credentials." });
  }
  const valid = await argon2.verify(admin.passwordHash, password);
  if (!valid) {
    return res.status(401).json({ message: "Invalid admin credentials." });
  }

  const token = signToken({ sub: admin._id.toString(), role: "admin" });
  setAuthCookie(res, token);

  res.json({ user: sanitizeUser(admin) });
});

const adminLogout = asyncHandler(async (req, res) => {
  clearAuthCookie(res);
  res.json({ message: "Logged out." });
});

const getOverviewStats = asyncHandler(async (req, res) => {
  const [
    totalUsers,
    activeUsers,
    totalMeetings,
    activeMeetings,
    completedMeetings,
    totalMessages,
  ] = await Promise.all([
    User.countDocuments({ role: "user" }),
    User.countDocuments({ role: "user", accountStatus: "active" }),
    Meeting.countDocuments({}),
    Meeting.countDocuments({ status: "active" }),
    Meeting.countDocuments({ status: "ended" }),
    Message.countDocuments({}),
  ]);

  res.json({
    totalUsers,
    activeUsers,
    totalMeetings,
    activeMeetings,
    completedMeetings,
    totalMessages,
  });
});

const listUsers = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(parseInt(req.query.limit) || 10, 100);
  const search = (req.query.search || "").toString().trim();
  const sortField = ["name", "email", "createdAt"].includes(req.query.sortBy)
    ? req.query.sortBy
    : "createdAt";
  const sortDir = req.query.sortDir === "asc" ? 1 : -1;

  const filter = { role: "user" };
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  const [users, total] = await Promise.all([
    User.find(filter)
      .sort({ [sortField]: sortDir })
      .skip((page - 1) * limit)
      .limit(limit),
    User.countDocuments(filter),
  ]);

  res.json({ users, total, page, totalPages: Math.ceil(total / limit) || 1 });
});

const getUserDetail = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.userId);
  if (!user) return res.status(404).json({ message: "User not found." });

  const meetingsHosted = await Meeting.countDocuments({ hostId: user._id });
  const meetingsJoined = await Meeting.countDocuments({ participants: user._id });
  const messagesSent = await Message.countDocuments({ senderId: user._id });

  res.json({
    user,
    activity: { meetingsHosted, meetingsJoined, messagesSent },
  });
});

const setUserStatusSchema = z.object({
  status: z.enum(["active", "deactivated"]),
});

const setUserStatus = asyncHandler(async (req, res) => {
  const { status } = setUserStatusSchema.parse(req.body);
  const user = await User.findById(req.params.userId);
  if (!user) return res.status(404).json({ message: "User not found." });

  user.accountStatus = status;
  await user.save();

  await AuditLog.create({
    actorId: req.user._id,
    actorRole: req.user.role,
    action: status === "active" ? "ACTIVATE_USER" : "DEACTIVATE_USER",
    target: user.email,
  });

  res.json({ user });
});

const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.userId);
  if (!user) return res.status(404).json({ message: "User not found." });

  await User.deleteOne({ _id: user._id });

  await AuditLog.create({
    actorId: req.user._id,
    actorRole: req.user.role,
    action: "DELETE_USER",
    target: user.email,
  });

  res.json({ message: "User deleted." });
});

const listMeetings = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(parseInt(req.query.limit) || 10, 100);
  const search = (req.query.search || "").toString().trim();
  const status = ["active", "ended"].includes(req.query.status) ? req.query.status : null;

  const filter = {};
  if (status) filter.status = status;
  if (search) {
    filter.$or = [
      { meetingId: { $regex: search, $options: "i" } },
      { title: { $regex: search, $options: "i" } },
    ];
  }

  const [meetings, total] = await Promise.all([
    Meeting.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("hostId", "name email"),
    Meeting.countDocuments(filter),
  ]);

  res.json({ meetings, total, page, totalPages: Math.ceil(total / limit) || 1 });
});

const getMeetingDetail = asyncHandler(async (req, res) => {
  const meeting = await Meeting.findOne({ meetingId: req.params.meetingId }).populate(
    "hostId",
    "name email"
  );
  if (!meeting) return res.status(404).json({ message: "Meeting not found." });

  await AuditLog.create({
    actorId: req.user._id,
    actorRole: req.user.role,
    action: "VIEW_MEETING",
    target: meeting.meetingId,
  });

  res.json({ meeting });
});

const getChatStats = asyncHandler(async (req, res) => {
  const [totalConversations, totalMessages] = await Promise.all([
    Conversation.countDocuments({}),
    Message.countDocuments({}),
  ]);
  res.json({ totalConversations, totalMessages });
});

const getAuditLogs = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(parseInt(req.query.limit) || 20, 100);

  const [logs, total] = await Promise.all([
    AuditLog.find({})
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("actorId", "name email"),
    AuditLog.countDocuments({}),
  ]);

  res.json({ logs, total, page, totalPages: Math.ceil(total / limit) || 1 });
});

// Simple day-bucketed counts for the last N days, used by the analytics charts.
const getAnalytics = asyncHandler(async (req, res) => {
  const days = Math.min(parseInt(req.query.days) || 14, 90);
  const since = new Date();
  since.setDate(since.getDate() - days);
  since.setHours(0, 0, 0, 0);

  async function bucketByDay(Model, dateField, extraMatch = {}) {
    const rows = await Model.aggregate([
      { $match: { [dateField]: { $gte: since }, ...extraMatch } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: `$${dateField}` } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    return rows.map((r) => ({ date: r._id, count: r.count }));
  }

  const [registrations, meetingsCreated, chatActivity] = await Promise.all([
    bucketByDay(User, "createdAt", { role: "user" }),
    bucketByDay(Meeting, "createdAt"),
    bucketByDay(Message, "createdAt"),
  ]);

  res.json({ registrations, meetingsCreated, chatActivity, sinceDays: days });
});


// GET /admin/feedback — post-call ratings/comments submitted by users,
// most recent first, plus an overall average rating.
const getFeedbackList = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(parseInt(req.query.limit) || 15, 100);
  const minRating = parseInt(req.query.minRating);

  const filter = {};
  if (minRating >= 1 && minRating <= 5) filter.rating = { $gte: minRating };

  const [feedback, total, aggregate] = await Promise.all([
    Feedback.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("userId", "name email")
      .populate("meetingId", "meetingId title"),
    Feedback.countDocuments(filter),
    Feedback.aggregate([
      { $group: { _id: null, avgRating: { $avg: "$rating" }, count: { $sum: 1 } } },
    ]),
  ]);

  res.json({
    feedback,
    total,
    page,
    totalPages: Math.ceil(total / limit) || 1,
    averageRating: aggregate[0]?.avgRating || 0,
    totalCount: aggregate[0]?.count || 0,
  });
});


module.exports = {
  adminLogin,
  adminLogout,
  getOverviewStats,
  listUsers,
  getUserDetail,
  setUserStatus,
  deleteUser,
  listMeetings,
  getMeetingDetail,
  getChatStats,
  getAuditLogs,
  getAnalytics,
  getFeedbackList,
};