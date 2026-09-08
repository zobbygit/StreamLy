const express = require("express");
const {
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
} = require("../controllers/meetingController");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

router.post("/", requireAuth, createMeeting);
router.post("/join", requireAuth, joinMeeting);
router.get("/sessions", requireAuth, getSessions);

// Scheduling — order matters: these static paths must come before the
// dynamic "/:meetingId" route below, or Express would try to match
// "scheduled" as a meetingId.
router.post("/schedule", requireAuth, scheduleMeeting);
router.get("/scheduled", requireAuth, getScheduledMeetings);
router.patch("/:meetingId/schedule", requireAuth, updateScheduledMeeting);
router.post("/:meetingId/cancel", requireAuth, cancelScheduledMeeting);

router.get("/:meetingId", requireAuth, getMeeting);
router.post("/:meetingId/end", requireAuth, endMeeting);
router.post("/:meetingId/leave", requireAuth, leaveMeeting);
router.post("/:meetingId/feedback", requireAuth, submitFeedback);

module.exports = router;