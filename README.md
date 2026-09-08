<div align="center">

# 🎥 Streamly
<img width="1920" height="922" alt="image" src="https://github.com/user-attachments/assets/54def3ee-9e92-4672-8696-be66587829df" />


**A modern, full-stack video conferencing & real-time chat platform**

Built with React, Node.js, Express, MongoDB, Socket.IO, and WebRTC.

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![Express](https://img.shields.io/badge/Express-4-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-8-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-4-010101?logo=socket.io&logoColor=white)](https://socket.io/)
[![WebRTC](https://img.shields.io/badge/WebRTC-Peer--to--Peer-333333?logo=webrtc&logoColor=white)](https://webrtc.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](#-license)

[Features](#-key-features) • [Tech Stack](#-tech-stack) • [Getting Started](#-getting-started) • [API Reference](#-api-reference) • [Deployment](#-deployment-guide)

</div>

---

## 📖 Overview

**Streamly** is a production-style video conferencing and team-communication platform — think a self-hosted, feature-rich alternative to Zoom/Google Meet combined with a Slack-style chat system. It supports instant and scheduled meetings, peer-to-peer WebRTC video with host controls, in-meeting and standalone real-time chat (1:1 and group), a notification system, post-call feedback collection, and a full admin dashboard for platform management.

The codebase is a **monorepo** with two independent apps:

- **`backend/`** — a Node.js/Express REST API + Socket.IO signaling server
- **`frontend/`** — a React (Vite) single-page application

> 📸 **Screenshots / Demo**
> _Add screenshots or a demo GIF/video here — e.g. `docs/screenshot-dashboard.png`, `docs/screenshot-meeting.png`, `docs/demo.gif`._

---

## ✨ Key Features

### Video Meetings

- Instant meetings (one click, unique 9-character code, e.g. `abc-def-ghi`)
- Scheduled meetings — title, description, date/time, duration, edit/cancel, timezone-safe (client sends ISO 8601 UTC)
- Peer-to-peer WebRTC video (mesh topology) with STUN/TURN configuration
- Screen sharing
- Background blur (canvas-based full-frame blur)
- In-call quick reactions (👍❤️😂👏🎉) and raise-hand
- Live elapsed-time timer synced from the server, plus an optional host-controlled countdown
- **Host controls** (server-enforced, not just hidden UI): mute everyone, disable everyone's camera, remove a participant
- Post-call star-rating + comment feedback modal

### Chat

- 1:1 and group conversations
- Real-time messaging via Socket.IO (text, images, video, audio, and file attachments — uploaded to Cloudinary)
- Voice notes (in-browser recording via `MediaRecorder`)
- Message reactions, editing, and soft-delete (server-enforced: only the sender may edit/delete)
- Typing indicators
- Full-text-ish search across your own message history
- Per-user "delete conversation" (hides it from your inbox only; reappears if the other person messages again)
- Unread badges, synced live

### Notifications

- In-app notification bell with unread badge, live updates via Socket.IO
- Notifications for: new messages, being added to a group, being removed from a meeting

### Account & Preferences

- JWT auth via HttpOnly cookies, Argon2id password hashing
- Profile photo upload (Cloudinary)
- Light/dark theme toggle (persisted, CSS-variable-driven)
- Personal data export (JSON download) and account deletion (anonymizing "soft delete" that preserves other users' shared history)

### Admin Dashboard

- Separate admin authentication (env-seeded on first boot)
- Overview stats, user management (search/paginate/activate/deactivate/delete), meeting oversight, chat stats, feedback review (with average rating), analytics charts (registrations/meetings/chat activity over time), and a unified audit log of platform activity

### Security

- Argon2id password hashing, JWT in HttpOnly + SameSite-aware cookies
- `helmet`, `hpp`, CORS allow-listing, rate limiting on auth-sensitive routes
- Zod schema validation on all mutating endpoints
- Server-side authorization on every meeting/chat/admin action — the client UI only ever *hides* controls it shouldn't show; the server independently re-checks host/ownership/admin status before acting

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend framework** | React 18 (Vite) |
| **Styling** | Tailwind CSS 3, custom CSS-variable theming (light/dark) |
| **Animation** | Framer Motion |
| **Icons** | Lucide React |
| **Charts** | Recharts (admin analytics) |
| **HTTP client** | Axios |
| **Routing** | React Router v6 |
| **Notifications (UI)** | react-hot-toast |
| **Backend runtime** | Node.js 18+, Express 4 |
| **Database** | MongoDB + Mongoose 8 |
| **Real-time** | Socket.IO 4 |
| **Video/audio** | WebRTC (browser-native, mesh topology) |
| **Auth** | JSON Web Tokens (HttpOnly cookies) + Argon2id |
| **Validation** | Zod |
| **File storage** | Cloudinary (avatars, chat attachments, voice notes) |
| **Security middleware** | Helmet, HPP, CORS, express-rate-limit |

---

## 📁 Project Structure

```text
streamly/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── cloudinary.js        # Cloudinary SDK configuration
│   │   │   └── db.js                # MongoDB connection
│   │   ├── controllers/
│   │   │   ├── adminController.js
│   │   │   ├── authController.js
│   │   │   ├── chatController.js
│   │   │   ├── meetingController.js
│   │   │   ├── notificationController.js
│   │   │   └── userController.js
│   │   ├── middleware/
│   │   │   ├── auth.js              # requireAuth / requireAdmin
│   │   │   ├── errorHandler.js      # centralized error + 404 handling
│   │   │   └── rateLimiters.js      # authLimiter / generalLimiter
│   │   ├── models/
│   │   │   ├── AuditLog.js
│   │   │   ├── Conversation.js
│   │   │   ├── Feedback.js
│   │   │   ├── Meeting.js
│   │   │   ├── MeetingParticipant.js
│   │   │   ├── Message.js
│   │   │   ├── Notification.js
│   │   │   └── User.js
│   │   ├── routes/
│   │   │   ├── adminRoutes.js
│   │   │   ├── authRoutes.js
│   │   │   ├── chatRoutes.js
│   │   │   ├── meetingRoutes.js
│   │   │   ├── notificationRoutes.js
│   │   │   └── userRoutes.js
│   │   ├── sockets/
│   │   │   └── index.js             # all Socket.IO event handlers
│   │   ├── utils/
│   │   │   ├── asyncHandler.js
│   │   │   ├── jwt.js               # sign/verify + cookie helpers
│   │   │   ├── meetingId.js         # "abc-def-ghi" code generator
│   │   │   └── seedAdmin.js         # bootstraps the admin account
│   │   └── server.js                # app entrypoint
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/              # Navbar, ControlBar, VideoTile, ChatComposer,
│   │   │                             # MessageBubble, ChatSidebar, ParticipantsSidebar,
│   │   │                             # NotificationBell, FeedbackModal, GlassCard, route guards…
│   │   ├── context/
│   │   │   ├── AuthContext.jsx
│   │   │   └── ThemeContext.jsx
│   │   ├── lib/
│   │   │   ├── api.js               # axios instance (withCredentials, timeout)
│   │   │   ├── chatUpload.js         # base64 file/voice-note upload helper
│   │   │   └── socket.js             # singleton Socket.IO client
│   │   ├── pages/
│   │   │   ├── admin/                # AdminLayout + all admin sub-pages
│   │   │   ├── Home.jsx, Login.jsx, Signup.jsx, AdminLogin.jsx
│   │   │   ├── Dashboard.jsx, ScheduleMeeting.jsx
│   │   │   ├── MeetingRoom.jsx
│   │   │   ├── Chat.jsx
│   │   │   ├── Sessions.jsx, SessionDetails.jsx
│   │   │   └── Profile.jsx
│   │   ├── styles/index.css          # Tailwind + theme CSS variables
│   │   ├── App.jsx                   # route table
│   │   └── main.jsx                  # entrypoint (Theme/Auth providers)
│   ├── .env.example
│   ├── vercel.json                   # SPA rewrite rule for Vercel
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## 🔐 Authentication & Authorization

- **Session mechanism**: JWT signed with `JWT_SECRET`, stored in an `HttpOnly` cookie (name configurable via `COOKIE_NAME`, default `streamly_token`). Never stored in `localStorage`.
- **Cookie attributes** flip automatically based on `NODE_ENV`:
  - Development: `SameSite=Lax`, not `Secure` (works over plain HTTP on `localhost`)
  - Production: `SameSite=None`, `Secure=true` (required when frontend and backend are on different domains, e.g. Vercel + Render)
- **Password hashing**: Argon2id via the `argon2` package.
- **Two separate identity spaces**: regular users (`role: "user"`) and a single seeded admin (`role: "admin"`), authenticated through **separate login endpoints** (`/api/auth/login` vs `/api/admin/login`) and separate frontend routes (`/login` vs `/admin/login`).
- **Admin bootstrap**: on server startup, `utils/seedAdmin.js` creates the admin account from `ADMIN_EMAIL` / `ADMIN_PASSWORD` / `ADMIN_NAME` if it doesn't already exist. Safe to run on every boot — never overwrites an existing password.
- **Server-side enforcement everywhere**: meeting host actions, message edit/delete, and all admin actions are re-validated on the server (via the authenticated session / `isSocketHost` for sockets), regardless of what the client UI shows or hides.

---

## 📡 API Reference

All endpoints are prefixed with `/api`. Except where noted, all request/response bodies are JSON. 🔒 = requires an authenticated session cookie. 👑 = requires an authenticated **admin** session.

### Auth — `/api/auth`

| Method | Endpoint | Auth | Description |
|---|---|:---:|---|
| `POST` | `/auth/signup` | — | Create an account. Body: `{ name, email, phone, password }`. Sets the auth cookie and returns the sanitized user. |
| `POST` | `/auth/login` | — | Log in. Body: `{ email, password }`. Rate-limited. |
| `POST` | `/auth/logout` | 🔒 | Clears the auth cookie. |
| `GET` | `/auth/me` | 🔒 | Returns the current authenticated user. |

### Users — `/api/users`

| Method | Endpoint | Auth | Description |
|---|---|:---:|---|
| `GET` | `/users/me` | 🔒 | Get your own profile. |
| `POST` | `/users/avatar` | 🔒 | Upload a profile photo. Body: `{ imageBase64 }` (data URL) → uploaded to Cloudinary. |
| `GET` | `/users/search?email=` | 🔒 | Search other active users by email (for starting a chat or building a group). |
| `GET` | `/users/me/export` | 🔒 | Download a JSON export of your own profile, meetings, conversations, messages, and feedback. |
| `DELETE` | `/users/me` | 🔒 | Delete (anonymize) your account. Body: `{ password }` — requires re-entering your password. |

### Meetings — `/api/meetings`

| Method | Endpoint | Auth | Description |
|---|---|:---:|---|
| `POST` | `/meetings` | 🔒 | Create an instant meeting. Generates a unique `meetingId`, makes you the host. |
| `POST` | `/meetings/join` | 🔒 | Join by code. Body: `{ meetingId }`. Activates a `scheduled` meeting on first join. |
| `GET` | `/meetings/sessions` | 🔒 | Your meeting history (`active`/`ended` meetings you hosted or joined). |
| `POST` | `/meetings/schedule` | 🔒 | Schedule a future meeting. Body: `{ title, description?, scheduledFor (ISO 8601), durationMinutes? }`. |
| `GET` | `/meetings/scheduled` | 🔒 | List your upcoming (`scheduled`/`cancelled`) meetings. |
| `PATCH` | `/meetings/:meetingId/schedule` | 🔒 | Edit a scheduled meeting (host only, before it starts). |
| `POST` | `/meetings/:meetingId/cancel` | 🔒 | Cancel a scheduled meeting (host only). |
| `GET` | `/meetings/:meetingId` | 🔒 | Get meeting details + participant list. |
| `POST` | `/meetings/:meetingId/end` | 🔒 | End a meeting (host or admin only). |
| `POST` | `/meetings/:meetingId/leave` | 🔒 | Leave a meeting you're in. |
| `POST` | `/meetings/:meetingId/feedback` | 🔒 | Submit post-call feedback. Body: `{ rating (1-5), comment? }`. One submission per user per meeting (upserts). |

### Chat — `/api/chat`

| Method | Endpoint | Auth | Description |
|---|---|:---:|---|
| `GET` | `/chat/conversations` | 🔒 | List your conversations (1:1 + group) with last message and unread count. |
| `POST` | `/chat/conversations` | 🔒 | Start (or reuse) a 1:1 conversation. Body: `{ userId }`. |
| `POST` | `/chat/groups` | 🔒 | Create a group conversation. Body: `{ name, participantIds[] }`. |
| `GET` | `/chat/conversations/:conversationId/messages` | 🔒 | Get a conversation's message history; marks messages as read. |
| `DELETE` | `/chat/conversations/:conversationId` | 🔒 | Hide a conversation from your own inbox (non-destructive). |
| `GET` | `/chat/search?q=` | 🔒 | Search your own message history. |
| `POST` | `/chat/upload` | 🔒 | Upload a file/image/voice-note. Body: `{ fileBase64, fileName? }` → Cloudinary URL + inferred type. |

### Notifications — `/api/notifications`

| Method | Endpoint | Auth | Description |
|---|---|:---:|---|
| `GET` | `/notifications` | 🔒 | Your 30 most recent notifications + unread count. |
| `PATCH` | `/notifications/read-all` | 🔒 | Mark all as read. |
| `PATCH` | `/notifications/:notificationId/read` | 🔒 | Mark one as read. |

### Admin — `/api/admin`

| Method | Endpoint | Auth | Description |
|---|---|:---:|---|
| `POST` | `/admin/login` | — | Admin login. Body: `{ email, password }`. Rate-limited. |
| `POST` | `/admin/logout` | 👑 | Clear the admin session. |
| `GET` | `/admin/overview` | 👑 | Platform-wide stats (users, meetings, messages). |
| `GET` | `/admin/users` | 👑 | Paginated/searchable/sortable user list. Query: `page, limit, search, sortBy, sortDir`. |
| `GET` | `/admin/users/:userId` | 👑 | User detail + activity summary. |
| `PATCH` | `/admin/users/:userId/status` | 👑 | Activate/deactivate a user. Body: `{ status: "active" \| "deactivated" }`. |
| `DELETE` | `/admin/users/:userId` | 👑 | Permanently delete a user record. |
| `GET` | `/admin/meetings` | 👑 | Paginated/filterable meeting list. Query: `page, limit, search, status`. |
| `GET` | `/admin/meetings/:meetingId` | 👑 | Meeting detail (logs a `VIEW_MEETING` audit entry). |
| `GET` | `/admin/chat/stats` | 👑 | Aggregate conversation/message counts (never exposes private content). |
| `GET` | `/admin/audit-logs` | 👑 | Paginated audit trail of logins, meeting creation, chat starts, and admin actions. |
| `GET` | `/admin/analytics` | 👑 | Day-bucketed registrations/meetings/chat-activity series. Query: `days` (default 14, max 90). |
| `GET` | `/admin/feedback` | 👑 | Paginated feedback list + average rating. Query: `page, limit, minRating`. |

### Misc

| Method | Endpoint | Auth | Description |
|---|---|:---:|---|
| `GET` | `/config/ice-servers` | — | Returns the WebRTC ICE server list (STUN, and TURN if configured) for the client to initialize `RTCPeerConnection`. |
| `GET` | `/health` | — | Liveness check → `{ status: "ok" }`. |

---

## ⚡ Real-Time Events (Socket.IO)

The Socket.IO connection is authenticated via the same HttpOnly cookie used for REST requests (read from the handshake headers) — there is no separate socket auth token.

<details>
<summary><strong>Chat events</strong></summary>

| Direction | Event | Purpose |
|---|---|---|
| C→S | `chat:join` | Join a conversation's room |
| C→S / S→C | `chat:message` | Send / receive a message (supports attachments) |
| C→S / S→C | `chat:typing` | Typing indicator |
| C→S / S→C | `chat:react` / `chat:reaction-update` | Toggle / broadcast a message reaction |
| C→S / S→C | `chat:edit-message` / `chat:message-updated` | Edit a message (sender-only, server-verified) |
| C→S / S→C | `chat:delete-message` / `chat:message-deleted` | Soft-delete a message (sender-only, server-verified) |
| S→C | `chat:notification` | Unread-badge trigger for other participants |
| S→C | `notification:new` | New notification-center entry |
| S→C | `presence:update` | Online/offline status change |

All chat mutation events (`chat:message`, `chat:react`, `chat:edit-message`, `chat:delete-message`) accept an **acknowledgement callback** — the server responds `{ success: true }` or `{ success: false, message }` so failures surface immediately instead of failing silently.

</details>

<details>
<summary><strong>Meeting events</strong></summary>

| Direction | Event | Purpose |
|---|---|---|
| C→S | `meeting:join` | Join a meeting room |
| S→C | `meeting:existing-peers` / `meeting:peer-joined` / `meeting:peer-left` | Room roster changes |
| C→S / S→C | `meeting:signal` | WebRTC offer/answer/ICE-candidate relay (mesh topology) |
| C→S / S→C | `meeting:media-state` | Mic/camera on-off broadcast |
| C→S / S→C | `meeting:chat` | In-meeting chat (supports attachments) |
| C→S | `meeting:mute-all` / `meeting:camera-off-all` / `meeting:remove-participant` | **Host-only** controls — verified server-side via `isSocketHost`, not just hidden UI |
| S→C | `meeting:force-mute` / `meeting:force-camera-off` / `meeting:removed` | Effects of the host controls above |
| C→S / S→C | `meeting:reaction` | Ephemeral floating emoji reaction |
| C→S / S→C | `meeting:hand-raise` | Raise/lower hand (persisted for late joiners) |
| C→S / S→C | `meeting:start-countdown` / `meeting:cancel-countdown` / `meeting:countdown` | Host-controlled countdown timer |
| S→C | `meeting:timer-sync` | Server-authoritative meeting start time, for a consistent elapsed-time display across participants |
| S→C | `meeting:ended` / `meeting:error` | Meeting-ended / error notifications |

</details>

---

## 🗄 Data Models

| Model | Purpose |
|---|---|
| `User` | Account, credentials, role (`user`/`admin`), `accountStatus` (`active`/`deactivated`/`deleted`) |
| `Meeting` | Instant + scheduled meetings, `status` lifecycle (`scheduled → active → ended`, or `cancelled`) |
| `MeetingParticipant` | Per-user join/leave history for a meeting |
| `Conversation` | 1:1 or group chat thread; `hiddenFor` implements non-destructive per-user deletion |
| `Message` | Chat/meeting-chat messages — attachments, reactions, edited/deleted flags, read tracking (`read` for 1:1, `readBy[]` for groups) |
| `Notification` | Per-user notification-center entries |
| `Feedback` | Post-call rating (1-5) + comment, one per user per meeting |
| `AuditLog` | Unified activity trail (logins, meeting/chat creation, admin actions) |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18 or later
- **MongoDB** (local install, or a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster)
- A **[Cloudinary](https://cloudinary.com/)** account (free tier is fine) — required for avatar/chat-file uploads
- *(Optional, for production)* a **TURN server** for reliable WebRTC behind restrictive NATs/firewalls

### 1. Clone the repository

```bash
git clone https://github.com/<your-username>/streamly.git
cd streamly
```

### 2. Backend setup

```bash
cd backend
cp .env.example .env
```

Fill in `.env` (see [Environment Variables](#-environment-variables) below), then:

```bash
npm install
npm run dev
```

The API + Socket.IO server starts on **`http://localhost:5000`**. On first boot it automatically connects to MongoDB and seeds the admin account from `ADMIN_EMAIL`/`ADMIN_PASSWORD`.

### 3. Frontend setup

In a separate terminal:

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

The app starts on **`http://localhost:5173`**.

### 4. Try it out

1. Visit `http://localhost:5173` → sign up a user account.
2. From the Dashboard, click **New Meeting**, or **Schedule** one for later.
3. Open a second browser (or an incognito window), sign up a second account, and join the meeting with the code to test video/chat between two participants.
4. Visit `http://localhost:5173/admin/login` and sign in with your `ADMIN_EMAIL` / `ADMIN_PASSWORD` to reach the admin dashboard.

---

## 🔧 Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Description |
|---|:---:|---|
| `PORT` | | Server port (default `5000`; Render/most hosts set this automatically) |
| `NODE_ENV` | ✅ | `development` or `production` — controls cookie `Secure`/`SameSite` behavior |
| `CLIENT_URL` | ✅ | Exact origin of the frontend (no trailing slash) — used for CORS and Socket.IO |
| `MONGO_URI` | ✅ | MongoDB connection string |
| `JWT_SECRET` | ✅ | Long random string used to sign auth tokens |
| `JWT_EXPIRES_IN` | | Token lifetime (default `7d`) |
| `COOKIE_NAME` | | Auth cookie name (default `streamly_token`) |
| `ADMIN_EMAIL` | ✅ | Seeded admin account email |
| `ADMIN_PASSWORD` | ✅ | Seeded admin account password |
| `ADMIN_NAME` | | Seeded admin display name |
| `CLOUDINARY_CLOUD_NAME` | ✅ | Cloudinary credential |
| `CLOUDINARY_API_KEY` | ✅ | Cloudinary credential |
| `CLOUDINARY_API_SECRET` | ✅ | Cloudinary credential |
| `STUN_URLS` | | STUN server(s) for WebRTC (default: Google's public STUN) |
| `TURN_URL` / `TURN_USERNAME` / `TURN_CREDENTIAL` | | TURN server for production NAT traversal (recommended, not required for local testing) |

### Frontend (`frontend/.env`)

| Variable | Required | Description |
|---|:---:|---|
| `VITE_API_URL` | ✅ | Backend REST base URL, e.g. `http://localhost:5000/api` |
| `VITE_SOCKET_URL` | ✅ | Backend Socket.IO URL, e.g. `http://localhost:5000` |

> ⚠️ Vite environment variables are baked in at **build time**. Changing them requires a rebuild/redeploy, not just a server restart.

---

## 🗃 Database Setup

Streamly uses MongoDB via Mongoose — no manual migrations or seed scripts are required beyond the automatic admin bootstrap.

- **Local**: install MongoDB Community Server and use `MONGO_URI=mongodb://localhost:27017/streamly`.
- **Cloud (recommended for production)**: create a free cluster on [MongoDB Atlas](https://www.mongodb.com/atlas), whitelist your backend host's IP (or `0.0.0.0/0` for simplicity on platforms with dynamic egress IPs like Render), and use the provided `mongodb+srv://...` connection string.
- Collections/indexes are created automatically by Mongoose on first use based on the schemas in `backend/src/models/`.

---

## 💻 Development & Production Commands

| Command | Where | Purpose |
|---|---|---|
| `npm run dev` | `backend/` | Start the API with `nodemon` (auto-restart on changes) |
| `npm start` | `backend/` | Start the API in production mode (`node src/server.js`) |
| `npm run dev` | `frontend/` | Start the Vite dev server with HMR |
| `npm run build` | `frontend/` | Production build → `frontend/dist/` |
| `npm run preview` | `frontend/` | Locally preview the production build |

---

## ☁️ Deployment Guide

Recommended split: **frontend → Vercel**, **backend → Render** (or any long-running Node host — a serverless-only platform is *not* sufficient because Socket.IO needs a persistent connection).

### Backend → Render

1. Create a **Web Service**, connect this repo.
2. **Root Directory**: `backend`
3. **Build Command**: `npm install`
4. **Start Command**: `npm start`
5. Add all backend environment variables from the table above (set `NODE_ENV=production` and `CLIENT_URL` to your live Vercel URL).
6. Do **not** manually set `PORT` — Render injects it automatically.

### Frontend → Vercel

1. Import the repo, set **Root Directory**: `frontend` (Framework Preset: Vite, auto-detected).
2. Add `VITE_API_URL` / `VITE_SOCKET_URL` pointing at your live Render backend URL.
3. `frontend/vercel.json` already includes the SPA rewrite rule needed for React Router's client-side routes to work on page refresh.
4. Deploy, then go back to Render and update `CLIENT_URL` to the real Vercel URL, and redeploy the backend so CORS/cookies pick it up.

### Database & Media

- **MongoDB Atlas** for the database (Render's filesystem is ephemeral).
- **Cloudinary** for avatar/chat-file/voice-note storage (already externalized, no server disk usage).

### WebRTC in production

- Google's public STUN server works out of the box for most networks.
- For reliable connections behind strict corporate/mobile NATs, configure a **TURN** server (self-hosted [coturn](https://github.com/coturn/coturn), or a managed provider like Twilio/Xirsys/Metered) via `TURN_URL`/`TURN_USERNAME`/`TURN_CREDENTIAL`.

---

## 🏗 Architecture Overview

```text
┌─────────────────┐        HTTPS (REST, cookie auth)        ┌──────────────────────┐
│                 │ ───────────────────────────────────────▶│                      │
│  React (Vite)   │                                          │  Express API         │
│  Vercel         │◀─────────────────────────────────────── │  Render              │
│                 │        WebSocket (Socket.IO)             │                      │
└────────┬────────┘ ◀────────────────────────────────────▶  └──────────┬───────────┘
         │                                                              │
         │  WebRTC peer-to-peer (mesh)                                  │  Mongoose
         │  media relayed directly between browsers,                   ▼
         │  signaling (offer/answer/ICE) relayed via Socket.IO   ┌─────────────┐
         ▼                                                       │  MongoDB    │
┌─────────────────┐                                              │  Atlas      │
│  Other browser   │                                             └─────────────┘
│  (peer)          │
└─────────────────┘

Cloudinary — avatar / chat-file / voice-note storage (both apps talk to it via the backend)
```

- **Auth flow**: signup/login issues a JWT in an HttpOnly cookie → every subsequent REST call and Socket.IO handshake automatically includes it → `requireAuth`/`requireAdmin` middleware (REST) and the Socket.IO `io.use()` middleware (sockets) verify it per-request/connection.
- **Video flow**: signaling (SDP offers/answers, ICE candidates) is relayed through Socket.IO; actual audio/video/screen-share media flows **directly between browsers** (peer-to-peer, mesh topology) — the server never touches media bytes, only signaling metadata. This scales well for small meetings; a large-meeting deployment would swap the mesh for an SFU (e.g. LiveKit, mediasoup) without changing the overall auth/signaling architecture.
- **Chat flow**: messages are persisted to MongoDB, then broadcast in real time to everyone in the relevant Socket.IO room; a REST fallback (`GET .../messages`) loads history for anyone who wasn't connected when a message arrived.

---

## 🩹 Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| Login "succeeds" but you're immediately logged out / `401` on every request in production | Cross-domain cookie blocked | Ensure `NODE_ENV=production` on the backend (flips cookies to `SameSite=None; Secure`) and `CLIENT_URL` exactly matches your deployed frontend origin |
| Frontend calls `localhost:5000` even after deploying | Vite env vars are baked in at build time | Set `VITE_API_URL`/`VITE_SOCKET_URL` in your hosting provider's dashboard, then trigger a **new build** (saving the env var alone does nothing) |
| Refreshing any non-home route 404s on Vercel | Missing SPA fallback | Confirm `frontend/vercel.json` exists and is deployed |
| File/voice-note uploads hang forever with no error | Cloudinary credentials are placeholders/invalid, or the backend can't reach Cloudinary | Check backend logs for `[chat upload] Cloudinary upload failed: ...`; verify real (non-placeholder) `CLOUDINARY_*` values |
| Two participants can't see/hear each other on restrictive networks | No TURN server configured | STUN alone fails behind some corporate/mobile NATs — configure `TURN_URL`/`TURN_USERNAME`/`TURN_CREDENTIAL` |
| `CORS` errors in the browser console | `CLIENT_URL` mismatch (protocol, trailing slash, or wrong domain) | Must match the browser's `Origin` header exactly — `https://app.vercel.app`, no trailing slash |
| Admin login doesn't work after first deploy | Admin not yet seeded, or wrong credentials | Check backend startup logs for `[seedAdmin] Admin account created for ...`; confirm `ADMIN_EMAIL`/`ADMIN_PASSWORD` match what you're entering |
| Backend takes 30-60s to respond after being idle | Free-tier host spin-down (e.g. Render free tier) | Expected behavior on free tiers — upgrade to an always-on instance to avoid it |

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m "Add your feature"`
4. Push and open a Pull Request

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

<div align="center">

Built with ❤️ using React, Node.js, and WebRTC.

</div>
