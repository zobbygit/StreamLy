require("dotenv").config();
const express = require("express");
const http = require("http");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const hpp = require("hpp");
const morgan = require("morgan");
const { Server } = require("socket.io");

const connectDB = require("./config/db");
const seedAdmin = require("./utils/seedAdmin");
const initSockets = require("./sockets");
const { generalLimiter } = require("./middleware/rateLimiters");
const { errorHandler, notFoundHandler } = require("./middleware/errorHandler");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const meetingRoutes = require("./routes/meetingRoutes");
const adminRoutes = require("./routes/adminRoutes");
const chatRoutes = require("./routes/chatRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const contactRoutes =require("./routes/contactRoutes.js");

const app = express();
const server = http.createServer(app);

// Strip a trailing slash if someone pastes the URL with one — the browser's
// Origin header never has a trailing slash, so "https://x.com/" would never
// match and every request would be silently blocked by CORS.
const CLIENT_URL = (process.env.CLIENT_URL || "http://localhost:5173").replace(/\/$/, "");

const io = new Server(server, {
  cors: { origin: CLIENT_URL, credentials: true },
});

// Render (and most PaaS hosts) sit behind a reverse proxy — this is required
// for req.secure / the "x-forwarded-proto" check that determines whether a
// Secure cookie can be set, and for express-rate-limit to see the real
// client IP instead of the proxy's.
app.set("trust proxy", 1);

app.use(
  helmet({
    contentSecurityPolicy: process.env.NODE_ENV === "production" ? undefined : false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);
app.use(hpp());
app.use(cors({ origin: CLIENT_URL, credentials: true }));
app.use(express.json({ limit: "20mb" })); // generous limit for base64 avatar/chat-file/voice-note uploads
app.use(cookieParser());
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
app.use(generalLimiter);

// Expose ICE server config (STUN/TURN) to the frontend for WebRTC setup.
app.get("/api/config/ice-servers", (req, res) => {
  const iceServers = [{ urls: (process.env.STUN_URLS || "stun:stun.l.google.com:19302").split(",") }];
  if (process.env.TURN_URL) {
    iceServers.push({
      urls: process.env.TURN_URL,
      username: process.env.TURN_USERNAME,
      credential: process.env.TURN_CREDENTIAL,
    });
  }
  res.json({ iceServers });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/meetings", meetingRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/contact", contactRoutes);

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

app.use(notFoundHandler);
app.use(errorHandler);

initSockets(io);

const PORT = process.env.PORT || 5000;

(async () => {
  await connectDB();
  await seedAdmin();
  server.listen(PORT, () => {
    console.log(`[server] Streamly backend running on port ${PORT}`);
  });
})();
