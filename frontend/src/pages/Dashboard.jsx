import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ShieldCheck, Plus, ArrowRight, Loader2, Sparkles, Clock, Mail, Video } from "lucide-react";
import toast from "react-hot-toast";
import Navbar from "../components/Navbar.jsx";
import GlassCard from "../components/GlassCard.jsx";
import api from "../lib/api";
import { useAuth } from "../context/AuthContext.jsx";

export default function Dashboard() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [joinCode, setJoinCode] = useState("");
  const [creating, setCreating] = useState(false);
  const [joining, setJoining] = useState(false);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000 * 30);
    return () => clearInterval(t);
  }, []);

  const handleCreateMeeting = async () => {
    setCreating(true);
    try {
      const { data } = await api.post("/meetings", {});
      await refreshUser();
      navigate(`/meeting/${data.meeting.meetingId}`);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Could not create meeting.");
    } finally {
      setCreating(false);
    }
  };

  const handleJoinMeeting = async (e) => {
    e.preventDefault();
    if (!joinCode.trim()) return;
    setJoining(true);
    try {
      const { data } = await api.post("/meetings/join", { meetingId: joinCode.trim() });
      navigate(`/meeting/${data.meeting.meetingId}`);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Could not join meeting.");
    } finally {
      setJoining(false);
    }
  };

  return (
    <div className="streamly-bg min-h-screen">
      <Navbar />

      {/* decorative floating glows */}
      <div className="pointer-events-none fixed top-24 left-10 h-56 w-56 rounded-full bg-cyan/10 blur-3xl animate-float-slow" />
      <div
        className="pointer-events-none fixed bottom-10 right-10 h-64 w-64 rounded-full bg-violet/10 blur-3xl animate-float-slow"
        style={{ animationDelay: "1.2s" }}
      />

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-10 md:py-14 grid lg:grid-cols-[1.4fr,1fr] gap-8 relative">
        {/* Left: Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
               <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 dark:bg-slate-800/80 border border-white dark:border-slate-700 shadow-sm text-xs font-semibold text-electric-blue mb-5">
            <Sparkles size={13} className="text-cyan animate-ping" /> Secure Peer-to-Peer Encryption
          </span>
          <h1 className="text-3xl md:text-5xl font-extrabold text-ink leading-tight tracking-tight">
            High quality video calls.
            <br />
            <span className="bg-streamly-gradient bg-clip-text text-transparent">
              Built for everyone.
            </span>
          </h1>
          <p className="mt-5 text-muted max-w-lg leading-relaxed">
            Connect from anywhere with ultra-low-latency video, seamless screen sharing, and
            real-time chat — all in one collaborative workspace.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-4">
            <motion.button
              whileHover={{ scale: 1.03, boxShadow: "0 20px 40px -10px rgba(37,99,235,0.45)" }}
              whileTap={{ scale: 0.97 }}
              onClick={handleCreateMeeting}
              disabled={creating}
              className="flex items-center justify-center gap-2 px-6 py-4 rounded-2xl text-white font-semibold bg-streamly-gradient animate-gradient-pan shadow-xl shadow-electric-blue/25 disabled:opacity-70"
            >
              {creating ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
              New Meeting
            </motion.button>

            <form
              onSubmit={handleJoinMeeting}
              className="flex items-center gap-2 rounded-2xl glass-panel px-2 py-2 shadow-glass flex-1 max-w-md focus-within:ring-2 focus-within:ring-electric-blue/30 transition-all"
            >
              <input
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
                placeholder="Enter meeting code (e.g. abc-def-ghi)"
                className="flex-1 bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted"
              />
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                type="submit"
                disabled={joining}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-midnight-navy text-white text-sm font-semibold disabled:opacity-70 hover:shadow-lg hover:shadow-midnight-navy/20 transition-shadow"
              >
                {joining ? <Loader2 size={14} className="animate-spin" /> : "Join"}
                {!joining && <ArrowRight size={14} />}
              </motion.button>
            </form>
          </div>
        </motion.div>

        {/* Right: Account card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12, duration: 0.5 }}
        >
          <GlassCard className="glow-border p-7 relative overflow-hidden">
            <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-streamly-gradient opacity-20 blur-2xl" />

            <p className="text-sm text-muted relative">Hi,</p>
            <h2 className="text-2xl font-bold text-ink mb-5 relative">{user?.name}</h2>

            <div className="space-y-4 relative">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-sm text-muted">
                  <Clock size={13} /> Local time
                </span>
                <span className="text-sm font-semibold text-royal-blue">
                  {now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted">Date</span>
                <span className="text-sm font-semibold text-royal-blue">
                  {now.toLocaleDateString(undefined, {
                    weekday: "long",
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-sm text-muted">
                  <Mail size={13} /> Logged in as
                </span>
                <span className="text-sm font-medium text-ink truncate max-w-[180px]">
                  {user?.email}
                </span>
              </div>
              <div className="h-px bg-gradient-to-r from-transparent via-line to-transparent" />
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-sm text-muted">
                  <Video size={13} /> Monthly meetings
                </span>
                <span className="text-sm font-semibold bg-gradient-to-r from-cyan to-violet bg-clip-text text-transparent">
                  {user?.monthlyMeetingsCreated ?? 0} Created
                </span>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </main>
    </div>
  );
}