const express = require("express");
const {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} = require("../controllers/notificationController");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

router.get("/", requireAuth, getNotifications);
router.patch("/read-all", requireAuth, markAllNotificationsRead);
router.patch("/:notificationId/read", requireAuth, markNotificationRead);

module.exports = router;