const { verifyToken } = require("../utils/jwt");
const User = require("../models/User");

// Requires a valid auth cookie. Attaches req.user (without passwordHash).
async function requireAuth(req, res, next) {
  try {
    const cookieName = process.env.COOKIE_NAME || "streamly_token";
    const token = req.cookies?.[cookieName];
    if (!token) {
      return res.status(401).json({ message: "Not authenticated." });
    }
    const decoded = verifyToken(token);
    const user = await User.findById(decoded.sub);
    if (!user) {
      return res.status(401).json({ message: "User no longer exists." });
    }
    if (user.accountStatus === "deactivated" || user.accountStatus === "deleted") {
      return res.status(403).json({ message: "Account is deactivated." });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired session." });
  }
}

// Requires req.user (set by requireAuth) to have role "admin".
function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access required." });
  }
  next();
}

module.exports = { requireAuth, requireAdmin };
