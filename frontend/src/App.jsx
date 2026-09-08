import { Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Profile from "./pages/Profile.jsx";
import MeetingRoom from "./pages/MeetingRoom.jsx";
import Chat from "./pages/Chat.jsx";
import Sessions from "./pages/Sessions.jsx";
import SessionDetails from "./pages/SessionDetails.jsx";
import ScheduleMeeting from "./pages/ScheduleMeeting.jsx";
import AdminLogin from "./pages/AdminLogin.jsx";

import AdminLayout from "./pages/admin/AdminLayout.jsx";
import AdminOverview from "./pages/admin/AdminOverview.jsx";
import AdminUsers from "./pages/admin/AdminUsers.jsx";
import AdminMeetings from "./pages/admin/AdminMeetings.jsx";
import AdminChat from "./pages/admin/AdminChat.jsx";
import AdminFeedback from "./pages/admin/AdminFeedback.jsx";
import AdminAuditLogs from "./pages/admin/AdminAuditLogs.jsx";
import AdminAnalytics from "./pages/admin/AdminAnalytics.jsx";
import AdminSettings from "./pages/admin/AdminSettings.jsx";

import ProtectedRoute from "./components/ProtectedRoute.jsx";
import AdminRoute from "./components/AdminRoute.jsx";

export default function App() {
  return (
    <>
      <Toaster position="top-center" toastOptions={{ duration: 3500 }} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/admin/login" element={<AdminLogin />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/schedule"
          element={
            <ProtectedRoute>
              <ScheduleMeeting />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/sessions"
          element={
            <ProtectedRoute>
              <Sessions />
            </ProtectedRoute>
          }
        />
        <Route
          path="/sessions/:meetingId"
          element={
            <ProtectedRoute>
              <SessionDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <Chat />
            </ProtectedRoute>
          }
        />
        <Route
          path="/meeting/:meetingId"
          element={
            <ProtectedRoute>
              <MeetingRoom />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route index element={<AdminOverview />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="meetings" element={<AdminMeetings />} />
          <Route path="chat" element={<AdminChat />} />
          <Route path="feedback" element={<AdminFeedback />} />
          <Route path="audit-logs" element={<AdminAuditLogs />} />
          <Route path="analytics" element={<AdminAnalytics />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>

        <Route path="*" element={<Home />} />
      </Routes>
    </>
  );
}