const express = require("express");
const {
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
} = require("../controllers/adminController");
const { requireAuth, requireAdmin } = require("../middleware/auth");
const { authLimiter } = require("../middleware/rateLimiters");

const router = express.Router();

// Public admin auth
router.post("/login", authLimiter, adminLogin);

// Everything below requires an authenticated admin
router.use(requireAuth, requireAdmin);

router.post("/logout", adminLogout);
router.get("/overview", getOverviewStats);

router.get("/users", listUsers);
router.get("/users/:userId", getUserDetail);
router.patch("/users/:userId/status", setUserStatus);
router.delete("/users/:userId", deleteUser);

router.get("/meetings", listMeetings);
router.get("/meetings/:meetingId", getMeetingDetail);

router.get("/chat/stats", getChatStats);
router.get("/audit-logs", getAuditLogs);
router.get("/analytics", getAnalytics);
router.get("/feedback", getFeedbackList);

module.exports = router;