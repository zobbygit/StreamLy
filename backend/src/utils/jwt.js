const jwt = require("jsonwebtoken");

function signToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
}

function verifyToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}

function setAuthCookie(res, token) {
  const cookieName = process.env.COOKIE_NAME || "streamly_token";
  const isProduction = process.env.NODE_ENV === "production";
  res.cookie(cookieName, token, {
    httpOnly: true,
    // Frontend (Vercel) and backend (Render) live on different domains in
    // production, which makes every API/Socket.IO request "cross-site" from
    // the cookie's point of view. Cross-site cookies require
    // SameSite=None, and SameSite=None is only honored by browsers when
    // Secure is also true — so both must flip together in production.
    // Locally, frontend and backend are on different ports of the same
    // "localhost" origin, which the SameSite spec treats as same-site, so
    // "lax" + non-secure keeps local HTTP dev working without HTTPS.
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/",
  });
}

function clearAuthCookie(res) {
  const cookieName = process.env.COOKIE_NAME || "streamly_token";
  const isProduction = process.env.NODE_ENV === "production";
  // clearCookie must be called with the SAME attributes used to set the
  // cookie (sameSite/secure/path) or some browsers will silently ignore it.
  res.clearCookie(cookieName, {
    path: "/",
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
  });
}

module.exports = { signToken, verifyToken, setAuthCookie, clearAuthCookie };