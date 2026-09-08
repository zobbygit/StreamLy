import { useEffect, useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Video, LayoutDashboard, History, MessageSquare, User, CalendarPlus, Sun, Moon } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";
import { getSocket } from "../lib/socket";
import api from "../lib/api";
import NotificationBell from "./NotificationBell.jsx";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/schedule", label: "Schedule", icon: CalendarPlus },
  { to: "/sessions", label: "Sessions", icon: History },
  { to: "/chat", label: "Chat", icon: MessageSquare, badge: true },
];

function NavBadge({ count }) {
  return (
    <AnimatePresence>
      {count > 0 && (
        <motion.span
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
          className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-gradient-to-br from-cyan to-violet text-white text-[10px] font-bold flex items-center justify-center shadow-[0_0_10px_rgba(6,182,212,0.6)]"
        >
          {count > 9 ? "9+" : count}
        </motion.span>
      )}
    </AnimatePresence>
  );
}

export default function Navbar() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch current unread total whenever this navbar mounts (i.e. on every
  // page navigation, since each page renders its own <Navbar />).
  useEffect(() => {
    let cancelled = false;
    api
      .get("/chat/conversations")
      .then(({ data }) => {
        if (cancelled) return;
        const total = data.conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0);
        setUnreadCount(location.pathname === "/chat" ? 0 : total);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [location.pathname]);

  // Live-increment the badge as new messages arrive while this navbar is mounted.
  useEffect(() => {
    const socket = getSocket();
    const handleNotification = () => {
      if (location.pathname !== "/chat") {
        setUnreadCount((c) => c + 1);
      }
    };
    socket.on("chat:notification", handleNotification);
    return () => socket.off("chat:notification", handleNotification);
  }, [location.pathname]);

  return (
    <header className="sticky top-0 z-40 glass-panel border-b border-white/40 bg-white/70">
      <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
        <div
          className="flex items-center gap-2 cursor-pointer group"
          onClick={() => navigate("/dashboard")}
        >
          {/* <div className="h-8 w-8 rounded-lg bg-streamly-gradient flex items-center justify-center shadow-md shadow-electric-blue/30 group-hover:shadow-electric-blue/50 transition-shadow">
            <Video size={16} className="text-white" />
          </div>
          <span className="font-extrabold text-ink text-lg tracking-tight">
            Streamly
          </span> */}




<motion.div
  initial={{ opacity: 0, x: -15 }}
  animate={{ opacity: 1, x: 0 }}
  transition={{ duration: 0.6 }}
  whileHover={{ scale: 1.02 }}
  className="group flex items-center gap-3 cursor-pointer"
  onClick={() => navigate("/")}
>
  {/* Icon */}
  <div className="relative">

    <motion.div
      animate={{
        scale: [1, 1.12, 1],
        opacity: [0.2, 0.4, 0.2],
      }}
      transition={{
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      className="
        absolute
        -inset-2
        rounded-2xl
        bg-gradient-to-r
        from-blue-500
        via-cyan-400
        to-indigo-500
        blur-lg
      "
    />

    <motion.div
      whileHover={{
        scale: 1.08,
        rotate: -4,
      }}
      className="
        relative
        h-10 w-10
        rounded-2xl
        bg-gradient-to-br
        from-blue-600
        via-blue-500
        to-cyan-500
        flex items-center justify-center
        shadow-lg
        shadow-blue-500/30
        ring-1 ring-white/70
        overflow-hidden
      "
    >
      <motion.div
        animate={{ x: ["-120%", "150%"] }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          repeatDelay: 2,
        }}
        className="
          absolute inset-y-0
          w-1/2
          bg-gradient-to-r
          from-transparent
          via-white/30
          to-transparent
          skew-x-[-20deg]
        "
      />

      <Video
        size={20}
        strokeWidth={2.2}
        className="relative z-10 text-white"
      />
    </motion.div>
  </div>

  {/* Wordmark */}
  <div className="relative group/logo">

    <span className="
      relative
      flex items-center
      text-[22px]
      font-black
      tracking-[-0.055em]
      leading-none
      bg-gradient-to-r
      from-[#172554]
      via-[#2563eb]
      to-[#06b6d4]
      bg-clip-text
      text-transparent
    ">
      Streamly

      <motion.span
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.7, 1, 0.7],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
        }}
        className="
          ml-1
          h-1.5 w-1.5
          rounded-full
          bg-cyan-400
          shadow-[0_0_10px_rgba(34,211,238,0.9)]
        "
      />
    </span>

    {/* Tiny brand line */}
    <div className="
      mt-1
      h-[2px]
      w-0
      rounded-full
      bg-gradient-to-r
      from-blue-500
      to-cyan-400
      group-hover/logo:w-full
      transition-all
      duration-500
    " />
  </div>
</motion.div>







        </div>

        <nav className="hidden md:flex items-center gap-1">
          {navItems.map(({ to, label, icon: Icon, badge }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `relative flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "text-electric-blue bg-gradient-to-r from-electric-blue/10 via-cyan/10 to-violet/10"
                    : "text-muted hover:text-ink hover:bg-black/5"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span className="relative">
                    <Icon size={16} />
                    {badge && <NavBadge count={unreadCount} />}
                  </span>
                  {label}
                  {isActive && (
                    <motion.span
                      layoutId="nav-indicator"
                      className="absolute -bottom-[9px] left-3 right-3 h-0.5 rounded-full bg-streamly-gradient"
                    />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <span className="hidden sm:block text-sm text-muted">
            Welcome, <span className="text-ink font-medium">{user?.name?.split(" ")[0]}</span>
          </span>
          <button
            onClick={toggleTheme}
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            className="h-9 w-9 rounded-full flex items-center justify-center text-muted hover:text-ink hover:bg-black/5 transition-colors"
          >
            {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
          </button>
          <NotificationBell />
          <button
            onClick={() => navigate("/profile")}
            className="h-9 w-9 rounded-full overflow-hidden border-2 border-white dark:border-slate-700 bg-white dark:bg-slate-800 flex items-center justify-center shadow-sm hover:ring-2 hover:ring-electric-blue/40 hover:shadow-md hover:shadow-electric-blue/20 transition-all"
          >
            {user?.avatar ? (
              <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
            ) : (
              <User size={16} className="text-muted" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      <nav className="md:hidden flex items-center justify-around border-t border-white/40 py-1.5">
        {navItems.map(({ to, label, icon: Icon, badge }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                isActive ? "text-electric-blue" : "text-muted"
              }`
            }
          >
            <span className="relative">
              <Icon size={18} />
              {badge && <NavBadge count={unreadCount} />}
            </span>
            {label}
          </NavLink>
        ))}
      </nav>
    </header>
  );
}