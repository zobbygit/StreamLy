import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, MessageSquare, Users, PhoneOff, Info, CheckCheck } from "lucide-react";
import api from "../lib/api";
import { getSocket } from "../lib/socket";

const ICONS = {
  message: MessageSquare,
  group_added: Users,
  meeting_removed: PhoneOff,
  system: Info,
};

function timeAgo(dateStr) {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function NotificationBell() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const socket = getSocket();

  const load = async () => {
    try {
      const { data } = await api.get("/notifications");
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch {
      /* non-critical */
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    const handleNew = (notif) => {
      setNotifications((prev) => [notif, ...prev].slice(0, 30));
      setUnreadCount((c) => c + 1);
    };
    socket.on("notification:new", handleNew);
    return () => socket.off("notification:new", handleNew);
  }, [socket]);

  const handleOpenNotification = async (notif) => {
    if (!notif.read) {
      setNotifications((prev) => prev.map((n) => (n._id === notif._id ? { ...n, read: true } : n)));
      setUnreadCount((c) => Math.max(0, c - 1));
      api.patch(`/notifications/${notif._id}/read`).catch(() => {});
    }
    setOpen(false);
    if (notif.link) navigate(notif.link);
  };

  const handleMarkAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
    try {
      await api.patch("/notifications/read-all");
    } catch {
      /* non-critical */
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative h-9 w-9 rounded-full flex items-center justify-center text-muted hover:text-ink hover:bg-black/5 transition-colors"
        title="Notifications"
      >
        <Bell size={18} />
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-0.5 -right-0.5 min-w-[16px] h-[16px] px-1 rounded-full bg-gradient-to-br from-cyan to-violet text-white text-[9px] font-bold flex items-center justify-center"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.96 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-11 w-80 max-w-[90vw] rounded-2xl bg-white dark:bg-slate-900 dark:border dark:border-slate-700 shadow-2xl border border-line z-50 overflow-hidden"
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-line/60">
                <p className="font-semibold text-ink text-sm">Notifications</p>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="flex items-center gap-1 text-xs text-electric-blue hover:underline"
                  >
                    <CheckCheck size={12} /> Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="text-sm text-muted text-center py-10">You're all caught up.</p>
                ) : (
                  notifications.map((n) => {
                    const Icon = ICONS[n.type] || Info;
                    return (
                      <button
                        key={n._id}
                        onClick={() => handleOpenNotification(n)}
                        className={`w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-black/5 transition-colors border-b border-line/30 last:border-none ${
                          !n.read ? "bg-electric-blue/5" : ""
                        }`}
                      >
                        <div className="h-8 w-8 rounded-full bg-electric-blue/10 flex items-center justify-center shrink-0 mt-0.5">
                          <Icon size={14} className="text-electric-blue" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-ink truncate">{n.title}</p>
                          {n.body && <p className="text-xs text-muted line-clamp-2 mt-0.5">{n.body}</p>}
                          <p className="text-[11px] text-muted mt-1">{timeAgo(n.createdAt)}</p>
                        </div>
                        {!n.read && (
                          <span className="h-2 w-2 rounded-full bg-electric-blue shrink-0 mt-1.5" />
                        )}
                      </button>
                    );
                  })
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}