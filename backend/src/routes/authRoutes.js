const express = require("express");
const { signup, login, logout, me } = require("../controllers/authController");
const { requireAuth } = require("../middleware/auth");
const { authLimiter } = require("../middleware/rateLimiters");

const router = express.Router();

router.post("/signup", authLimiter, signup);
router.post("/login", authLimiter, login);
router.post("/logout", requireAuth, logout);
router.get("/me", requireAuth, me);

module.exports = router;
