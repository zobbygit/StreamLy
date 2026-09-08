const express = require("express");
const {
  getConversations,
  startConversation,
  createGroupConversation,
  getMessages,
  uploadChatFile,
  searchMessages,
  deleteConversation,
} = require("../controllers/chatController");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

router.get("/conversations", requireAuth, getConversations);
router.post("/conversations", requireAuth, startConversation);
router.post("/groups", requireAuth, createGroupConversation);
router.get("/search", requireAuth, searchMessages);
router.post("/upload", requireAuth, uploadChatFile);
router.get("/conversations/:conversationId/messages", requireAuth, getMessages);
router.delete("/conversations/:conversationId", requireAuth, deleteConversation);

module.exports = router;