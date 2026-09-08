const Notification = require("../models/Notification");
const asyncHandler = require("../utils/asyncHandler");

const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ userId: req.user._id })
    .sort({ createdAt: -1 })
    .limit(30);

  const unreadCount = await Notification.countDocuments({
    userId: req.user._id,
    read: false,
  });

  res.json({ notifications, unreadCount });
});

const markNotificationRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOne({
    _id: req.params.notificationId,
    userId: req.user._id,
  });
  if (!notification) {
    return res.status(404).json({ message: "Notification not found." });
  }
  notification.read = true;
  await notification.save();
  res.json({ notification });
});

const markAllNotificationsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ userId: req.user._id, read: false }, { read: true });
  res.json({ message: "All notifications marked as read." });
});

module.exports = { getNotifications, markNotificationRead, markAllNotificationsRead };