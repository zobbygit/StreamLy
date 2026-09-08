const argon2 = require("argon2");
const User = require("../models/User");

// Ensures the admin account defined in .env exists in MongoDB on boot.
// Safe to run on every startup — it only creates the account if missing,
// and never overwrites an existing password.
async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME || "Admin";

  if (!email || !password) {
    console.warn("[seedAdmin] ADMIN_EMAIL / ADMIN_PASSWORD not set — skipping admin seed.");
    return;
  }

  const existing = await User.findOne({ email: email.toLowerCase(), role: "admin" });
  if (existing) {
    console.log("[seedAdmin] Admin account already exists.");
    return;
  }

  const passwordHash = await argon2.hash(password);
  await User.create({
    name,
    email: email.toLowerCase(),
    phone: "0000000000",
    passwordHash,
    role: "admin",
  });
  console.log(`[seedAdmin] Admin account created for ${email}`);
}

module.exports = seedAdmin;
