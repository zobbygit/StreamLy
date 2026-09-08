import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Camera,
  Mail,
  Phone,
  Calendar,
  LogOut,
  Loader2,
  User,
  Download,
  Trash2,
  X,
  ShieldAlert,
} from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import GlassCard from "../components/GlassCard.jsx";
import api from "../lib/api";
import { useAuth } from "../context/AuthContext.jsx";

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function DeleteAccountModal({ onClose, onConfirm, deleting }) {
  const [password, setPassword] = useState("");

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="
          w-full
          max-w-sm
          rounded-2xl
          border
          border-line
          bg-surface-base
          shadow-2xl
          p-5
        "
      >
        <div className="flex items-center justify-between mb-2">
          <p className="font-semibold text-ink flex items-center gap-2">
            <ShieldAlert size={16} className="text-red-500" />
            Delete your account
          </p>

          <button
            onClick={onClose}
            className="
              p-1
              rounded-lg
              text-muted
              hover:bg-black/5
              transition-colors
            "
          >
            <X size={16} />
          </button>
        </div>

        <p className="text-sm text-muted mb-4">
          This permanently removes your name, email, phone, and photo from
          Streamly. Your past meetings and messages stay visible to other
          participants, but your identity is anonymized. This can't be undone.
        </p>

        <label className="text-sm font-medium text-ink">
          Confirm your password
        </label>

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="
            mt-1.5
            w-full
            rounded-xl
            border
            border-line
            bg-surface-base
            text-ink
            placeholder:text-muted
            px-3.5
            py-2.5
            text-sm
            outline-none
            focus:border-red-400
            focus:ring-4
            focus:ring-red-500/10
            transition-all
            mb-4
          "
          placeholder="••••••••"
        />

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="
              px-3.5
              py-2
              rounded-xl
              text-sm
              text-muted
              hover:bg-black/5
              transition-colors
            "
          >
            Cancel
          </button>

          <button
            onClick={() => onConfirm(password)}
            disabled={deleting || !password}
            className="
              px-3.5
              py-2
              rounded-xl
              text-sm
              font-semibold
              text-white
              bg-red-500
              hover:bg-red-600
              disabled:opacity-60
              flex
              items-center
              gap-1.5
              transition-colors
            "
          >
            {deleting && (
              <Loader2 size={14} className="animate-spin" />
            )}

            Delete my account
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default function Profile() {
  const { user, setUser, logout } = useAuth();
  const navigate = useNavigate();

  const fileInputRef = useRef(null);

  const [uploading, setUploading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB.");
      return;
    }

    setUploading(true);

    try {
      const base64 = await fileToBase64(file);

      const { data } = await api.post("/users/avatar", {
        imageBase64: base64,
      });

      setUser(data.user);

      toast.success("Profile photo updated.");
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Upload failed."
      );
    } finally {
      setUploading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const handleExport = async () => {
    setExporting(true);

    try {
      const { data } = await api.get("/users/me/export", {
        responseType: "blob",
      });

      const url = URL.createObjectURL(
        new Blob([data], {
          type: "application/json",
        })
      );

      const a = document.createElement("a");

      a.href = url;
      a.download = "streamly-data-export.json";

      document.body.appendChild(a);
      a.click();
      a.remove();

      URL.revokeObjectURL(url);

      toast.success("Your data export has downloaded.");
    } catch (err) {
      toast.error("Could not export your data.");
    } finally {
      setExporting(false);
    }
  };

  const handleDeleteAccount = async (password) => {
    setDeleting(true);

    try {
      await api.delete("/users/me", {
        data: { password },
      });

      toast.success("Your account has been deleted.");

      navigate("/");
    } catch (err) {
      toast.error(
        err?.response?.data?.message ||
          "Could not delete account."
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="streamly-bg min-h-screen">
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 md:px-6 py-10 space-y-6">

        {/* ================= PROFILE ================= */}

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <GlassCard className="p-8">

            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">

              {/* Avatar */}

              <div className="relative">
                <div
                  className="
                    h-24
                    w-24
                    rounded-full
                    overflow-hidden
                    bg-electric-blue/10
                    flex
                    items-center
                    justify-center
                    border-2
                    border-line
                    shadow-lg
                  "
                >
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <User
                      size={32}
                      className="text-electric-blue"
                    />
                  )}
                </div>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="
                    absolute
                    bottom-0
                    right-0
                    h-8
                    w-8
                    rounded-full
                    bg-electric-blue
                    text-white
                    flex
                    items-center
                    justify-center
                    shadow-lg
                    hover:bg-royal-blue
                    transition-colors
                    disabled:opacity-60
                  "
                >
                  {uploading ? (
                    <Loader2
                      size={14}
                      className="animate-spin"
                    />
                  ) : (
                    <Camera size={14} />
                  )}
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>

              {/* User information */}

              <div className="flex-1 text-center sm:text-left">
                <h1 className="text-2xl font-bold text-ink">
                  {user?.name}
                </h1>

                <p className="text-sm text-muted capitalize">
                  {user?.role} account
                </p>
              </div>
            </div>

            {/* ================= USER DETAILS ================= */}

            <div className="mt-8 grid sm:grid-cols-2 gap-4">

              {/* Email */}

              <div
                className="
                  flex
                  items-center
                  gap-3
                  rounded-xl
                  bg-black/[0.02]
                  dark:bg-white/[0.03]
                  border
                  border-line/60
                  px-4
                  py-3
                  transition-colors
                "
              >
                <Mail
                  size={16}
                  className="text-electric-blue"
                />

                <div>
                  <p className="text-xs text-muted">
                    Email
                  </p>

                  <p className="text-sm font-medium text-ink">
                    {user?.email}
                  </p>
                </div>
              </div>

              {/* Phone */}

              <div
                className="
                  flex
                  items-center
                  gap-3
                  rounded-xl
                  bg-black/[0.02]
                  dark:bg-white/[0.03]
                  border
                  border-line/60
                  px-4
                  py-3
                  transition-colors
                "
              >
                <Phone
                  size={16}
                  className="text-electric-blue"
                />

                <div>
                  <p className="text-xs text-muted">
                    Phone
                  </p>

                  <p className="text-sm font-medium text-ink">
                    {user?.phone}
                  </p>
                </div>
              </div>

              {/* Member since */}

              <div
                className="
                  flex
                  items-center
                  gap-3
                  rounded-xl
                  bg-black/[0.02]
                  dark:bg-white/[0.03]
                  border
                  border-line/60
                  px-4
                  py-3
                  sm:col-span-2
                  transition-colors
                "
              >
                <Calendar
                  size={16}
                  className="text-electric-blue"
                />

                <div>
                  <p className="text-xs text-muted">
                    Member since
                  </p>

                  <p className="text-sm font-medium text-ink">
                    {user?.createdAt
                      ? new Date(
                          user.createdAt
                        ).toLocaleDateString(undefined, {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "—"}
                  </p>
                </div>
              </div>
            </div>

            {/* Logout */}

            <button
              onClick={handleLogout}
              className="
                mt-8
                flex
                items-center
                gap-2
                px-5
                py-2.5
                rounded-xl
                border
                border-red-400/30
                text-red-500
                hover:bg-red-500/10
                font-medium
                text-sm
                transition-colors
              "
            >
              <LogOut size={16} />
              Log out
            </button>

          </GlassCard>
        </motion.div>

        {/* ================= DATA & PRIVACY ================= */}

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.06 }}
        >
          <GlassCard className="p-8">

            <h2 className="font-semibold text-ink mb-1">
              Data & privacy
            </h2>

            <p className="text-sm text-muted mb-5">
              Download a copy of your data, or permanently
              delete your account.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">

              {/* Export */}

              <button
                onClick={handleExport}
                disabled={exporting}
                className="
                  flex
                  items-center
                  justify-center
                  gap-2
                  px-5
                  py-2.5
                  rounded-xl
                  border
                  border-line
                  text-ink
                  hover:bg-black/5
                  dark:hover:bg-white/10
                  font-medium
                  text-sm
                  transition-colors
                  disabled:opacity-60
                "
              >
                {exporting ? (
                  <Loader2
                    size={16}
                    className="animate-spin"
                  />
                ) : (
                  <Download size={16} />
                )}

                Export my data
              </button>

              {/* Delete */}

              <button
                onClick={() => setDeleteModalOpen(true)}
                className="
                  flex
                  items-center
                  justify-center
                  gap-2
                  px-5
                  py-2.5
                  rounded-xl
                  border
                  border-red-400/30
                  text-red-500
                  hover:bg-red-500/10
                  font-medium
                  text-sm
                  transition-colors
                "
              >
                <Trash2 size={16} />
                Delete account
              </button>

            </div>
          </GlassCard>
        </motion.div>
      </main>

      {/* ================= DELETE MODAL ================= */}

      <AnimatePresence>
        {deleteModalOpen && (
          <DeleteAccountModal
            deleting={deleting}
            onClose={() => setDeleteModalOpen(false)}
            onConfirm={handleDeleteAccount}
          />
        )}
      </AnimatePresence>
    </div>
  );
}