const { z } = require("zod");
const argon2 = require("argon2");
const User = require("../models/User");
const AuditLog = require("../models/AuditLog");
const asyncHandler = require("../utils/asyncHandler");
const { signToken, setAuthCookie, clearAuthCookie } = require("../utils/jwt");

const signupSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(80),
  email: z.string().trim().email("Invalid email address").toLowerCase(),
  phone: z
    .string()
    .trim()
    .min(7, "Enter a valid phone number")
    .max(20, "Enter a valid phone number"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128),
});

const loginSchema = z.object({
  email: z.string().trim().email("Invalid email address").toLowerCase(),
  password: z.string().min(1, "Password is required"),
});

function sanitizeUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    avatar: user.avatar,
    role: user.role,
    accountStatus: user.accountStatus,
    monthlyMeetingsCreated: user.monthlyMeetingsCreated,
    createdAt: user.createdAt,
  };
}

const signup = asyncHandler(async (req, res) => {
  const data = signupSchema.parse(req.body);

  const existing = await User.findOne({ email: data.email });
  if (existing) {
    return res.status(409).json({ message: "An account with this email already exists." });
  }

  const passwordHash = await argon2.hash(data.password);
  const user = await User.create({
    name: data.name,
    email: data.email,
    phone: data.phone,
    passwordHash,
    role: "user",
  });

  const token = signToken({ sub: user._id.toString(), role: user.role });
  setAuthCookie(res, token);

  res.status(201).json({ user: sanitizeUser(user) });
});

const login = asyncHandler(async (req, res) => {
  const data = loginSchema.parse(req.body);

  const user = await User.findOne({ email: data.email }).select("+passwordHash");
  if (!user) {
    return res.status(401).json({ message: "Invalid email or password." });
  }
  if (user.accountStatus === "deactivated" || user.accountStatus === "deleted") {
    return res.status(403).json({ message: "This account has been deactivated." });
  }

  const valid = await argon2.verify(user.passwordHash, data.password);
  if (!valid) {
    return res.status(401).json({ message: "Invalid email or password." });
  }

  user.lastSeen = new Date();
  await user.save();

  const token = signToken({ sub: user._id.toString(), role: user.role });
  setAuthCookie(res, token);

  AuditLog.create({
    actorId: user._id,
    actorRole: user.role,
    action: "USER_LOGIN",
    target: user.email,
  }).catch((err) => console.error("[audit] failed to log login:", err.message));

  res.json({ user: sanitizeUser(user) });
});

const logout = asyncHandler(async (req, res) => {
  clearAuthCookie(res);
  res.json({ message: "Logged out." });
});

const me = asyncHandler(async (req, res) => {
  res.json({ user: sanitizeUser(req.user) });
});

module.exports = { signup, login, logout, me, sanitizeUser };