import { AnimatePresence, motion } from "framer-motion";
import {
  BarChart3,
  Camera,
  FileText,
  LayoutDashboard,
  Loader2,
  LogOut,
  Mail,
  Menu,
  MessageSquare,
  Settings,
  ShieldCheck,
  User,
  Star,
  Users,
  Video,
  X,
} from "lucide-react";
import { useRef, useState } from "react";
import toast from "react-hot-toast";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import api from "../../lib/api";

const navItems = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/meetings", label: "Meetings", icon: Video },
  { to: "/admin/chat", label: "Chat", icon: MessageSquare },
  { to: "/admin/feedback", label: "Feedback", icon: Star },
  { to: "/admin/audit-logs", label: "Audit Logs", icon: FileText },
  { to: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/admin/settings", label: "Settings", icon: Settings },
];
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function SidebarContent({ onNavigate }) {
  return (
    <nav className="flex-1 px-3 py-4 space-y-1">
      {navItems.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          onClick={onNavigate}
          className={({ isActive }) =>
            `flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              isActive
                ? "bg-gradient-to-r from-cyan/20 to-violet/10 text-cyan"
                : "text-white/60 hover:bg-white/5 hover:text-white"
            }`
          }
        >
          <Icon size={16} />
          {label}
        </NavLink>
      ))}
    </nav>
  );
}

export default function AdminLayout() {
  const { user, setUser, logout } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [profilePopoverOpen, setProfilePopoverOpen] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/admin/login");
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB.");
      return;
    }
    setUploading(true);
    try {
      const base64 = await fileToBase64(file);
      const { data } = await api.post("/users/avatar", { imageBase64: base64 });
      setUser(data.user);
      toast.success("Admin photo updated.");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-midnight-navy flex">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-64 shrink-0 border-r border-white/10 flex-col">
        <div className="h-16 flex items-center gap-2 px-5 border-b border-white/10">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-cyan/30 to-violet/20 flex items-center justify-center">
            <ShieldCheck size={16} className="text-cyan" />
          </div>
          <span className="text-white font-bold">Streamly Admin</span>
        </div>

        <SidebarContent />

        <div className="p-3 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <LogOut size={16} /> Log out
          </button>
        </div>
      </aside>

      {/* Mobile sidebar (slide-in drawer) */}
      <AnimatePresence>
        {mobileNavOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileNavOpen(false)}
              className="fixed inset-0 bg-black/60 z-40 md:hidden"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="fixed left-0 top-0 bottom-0 w-72 bg-midnight-navy border-r border-white/10 z-50 flex flex-col md:hidden"
            >
              <div className="h-16 flex items-center justify-between gap-2 px-5 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-cyan/30 to-violet/20 flex items-center justify-center">
                    <ShieldCheck size={16} className="text-cyan" />
                  </div>
                  <span className="text-white font-bold">Streamly Admin</span>
                </div>
                <button
                  onClick={() => setMobileNavOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-white/10"
                >
                  <X size={18} className="text-white" />
                </button>
              </div>

              <SidebarContent onNavigate={() => setMobileNavOpen(false)} />

              <div className="p-3 border-t border-white/10">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <LogOut size={16} /> Log out
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar: hamburger (mobile) + admin avatar/popover */}
        <header className="h-16 flex items-center justify-between px-4 md:px-8 border-b border-white/10 shrink-0">
          <button
            onClick={() => setMobileNavOpen(true)}
            className="md:hidden p-2 rounded-lg hover:bg-white/10"
          >
            <Menu size={20} className="text-white" />
          </button>
          <span className="hidden md:block" />

          <div className="relative">
            <button
              onClick={() => setProfilePopoverOpen((v) => !v)}
              className="h-9 w-9 rounded-full overflow-hidden border-2 border-white/10 bg-white/5 flex items-center justify-center hover:ring-2 hover:ring-cyan/40 transition-all"
            >
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <User size={16} className="text-white/60" />
              )}
            </button>

            <AnimatePresence>
              {profilePopoverOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setProfilePopoverOpen(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-12 w-64 rounded-2xl bg-[#0d1526] border border-white/10 shadow-2xl z-50 p-4"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="relative h-12 w-12 rounded-full overflow-hidden border-2 border-white/10 bg-white/5 flex items-center justify-center shrink-0">
                        {user?.avatar ? (
                          <img
                            src={user.avatar}
                            alt={user.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <User size={18} className="text-white/60" />
                        )}
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          disabled={uploading}
                          className="absolute bottom-0 right-0 h-5 w-5 rounded-full bg-cyan text-ink flex items-center justify-center"
                        >
                          {uploading ? (
                            <Loader2 size={10} className="animate-spin" />
                          ) : (
                            <Camera size={10} />
                          )}
                        </button>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleAvatarChange}
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="text-white font-semibold text-sm truncate">
                          {user?.name}
                        </p>
                        <p className="text-white/50 text-xs flex items-center gap-1 truncate">
                          <Mail size={11} /> {user?.email}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <LogOut size={14} /> Log out
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
