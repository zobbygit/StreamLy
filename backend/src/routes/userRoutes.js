const express = require("express");
const {
  getProfile,
  updateAvatar,
  searchUsers,
  exportMyData,
  deleteMyAccount,
} = require("../controllers/userController");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

router.get("/me", requireAuth, getProfile);
router.post("/avatar", requireAuth, updateAvatar);
router.get("/search", requireAuth, searchUsers);
router.get("/me/export", requireAuth, exportMyData);
router.delete("/me", requireAuth, deleteMyAccount);

module.exports = router;