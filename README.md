# Streamly

A modern 2026 video conferencing & real-time chat platform — React + Vite + Tailwind on the
frontend, Node/Express + MongoDB + Socket.IO + WebRTC on the backend.

## What's included

- **Auth**: JWT in HttpOnly cookies, Argon2id password hashing, Zod validation.
- **Meetings**: instant meeting creation, join-by-code, host/participant roles, end/leave flows.
- **Video**: WebRTC mesh (peer-to-peer) with Socket.IO signaling, mic/camera toggles, screen share.
- **Chat**: in-meeting chat + a dedicated 1:1 real-time chat system with user search.
- **Sessions**: meeting history per user, with re-join for active meetings.
- **Profile**: Cloudinary-backed avatar upload.
- **Admin**: separate admin login, overview stats, user management (search/activate/deactivate/
  delete), meeting management, chat stats, audit logs, and analytics charts.
- **Security**: helmet, rate limiting, HPP, input validation, server-side permission checks on
  every meeting/chat/admin action.

## Project structure

```
streamly/
  backend/     Express API + Socket.IO signaling server
  frontend/    React (Vite) client
```

## Prerequisites

- Node.js 18+
- A MongoDB instance (local or MongoDB Atlas)
- A Cloudinary account (for avatar uploads) — optional to start, but avatar upload will fail
  without valid credentials
- (Optional, for production) a TURN server for reliable WebRTC behind restrictive NATs

## 1. Backend setup

```bash
cd backend
cp .env.example .env
# edit .env: set MONGO_URI, JWT_SECRET, ADMIN_EMAIL/ADMIN_PASSWORD, Cloudinary keys, etc.
npm install
npm run dev
```

The backend starts on `http://localhost:5000` by default and will automatically create the
admin account from `ADMIN_EMAIL` / `ADMIN_PASSWORD` in MongoDB on first boot.

## 2. Frontend setup

```bash
cd frontend
cp .env.example .env
# edit .env if your backend runs somewhere other than localhost:5000
npm install
npm run dev
```

The frontend starts on `http://localhost:5173`.

## 3. Using the app

1. Visit `http://localhost:5173` → Sign up a normal user account.
2. From the Dashboard, click **New Meeting** to create and enter a room, or enter a meeting code
   to join one.
3. Visit `http://localhost:5173/admin/login` and sign in with the `ADMIN_EMAIL` /
   `ADMIN_PASSWORD` you set in `backend/.env` to reach the Admin Dashboard.

## Notes on scaling video

The current signaling design uses a WebRTC **mesh** topology (every participant connects
directly to every other participant), which is simple and works well for small meetings.
For larger rooms, swap the mesh in `backend/src/sockets/index.js` and
`frontend/src/pages/MeetingRoom.jsx` for an SFU such as **LiveKit** or **mediasoup** — the
signaling event names and data model here were kept intentionally simple so that swap is
localized to those two files.

## Deployment

- **Frontend** → Vercel / Netlify (static build via `npm run build`)
- **Backend** → Render / Railway / Fly.io / any long-running Node host (needed for persistent
  Socket.IO connections — a serverless-only host like Vercel functions is not sufficient)
- **Database** → MongoDB Atlas
- **Images** → Cloudinary
- **STUN/TURN** → Google's public STUN works for testing; use a real TURN provider (e.g. Twilio,
  Xirsys, or self-hosted coturn) for production reliability behind NAT/firewalls.
