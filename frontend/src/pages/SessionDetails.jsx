
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Copy,
  Calendar,
  Clock,
  Users,
  MessageSquare,
  Crown,
  Radio,
  Loader2,
  User,
  Hash,
  Video,
} from "lucide-react";
import toast from "react-hot-toast";
import Navbar from "../components/Navbar.jsx";
import GlassCard from "../components/GlassCard.jsx";
import api from "../lib/api";

// Formats a millisecond duration as "1h 24m" / "8m 12s" / "42s".
function formatDuration(ms) {
  if (!ms || ms < 0) return "—";
  const totalSeconds = Math.floor(ms / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

export default function SessionDetails() {
  const { meetingId } = useParams();
  const navigate = useNavigate();
  const [meeting, setMeeting] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [durationMs, setDurationMs] = useState(0);
  const [loading, setLoading] = useState(true);
  const [rejoining, setRejoining] = useState(false);

  const [selectedAvatar, setSelectedAvatar] = useState(null);
  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get(`/meetings/${meetingId}`);
        setMeeting(data.meeting);
        setParticipants(data.participants || []);
        setDurationMs(data.durationMs || 0);
      } catch (err) {
        toast.error(err?.response?.data?.message || "Could not load meeting details.");
        navigate("/sessions");
      } finally {
        setLoading(false);
      }
    })();
  }, [meetingId, navigate]);

  const handleCopyId = () => {
    navigator.clipboard.writeText(meetingId);
    toast.success("Meeting ID copied!");
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${meetingId}`);
    toast.success("Meeting link copied!");
  };

  const handleRejoin = async () => {
    setRejoining(true);
    try {
      await api.post("/meetings/join", { meetingId });
      navigate(`/meeting/${meetingId}`);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Could not rejoin this meeting.");
    } finally {
      setRejoining(false);
    }
  };

  if (loading) {
    return (
      <div className="streamly-bg min-h-screen">
        <Navbar />
        <div className="flex flex-col items-center justify-center py-32 gap-3">
          <Loader2 className="animate-spin text-electric-blue" size={32} />
          <p className="text-sm text-muted">Loading meeting details...</p>
        </div>
      </div>
    );
  }

  if (!meeting) return null;

  const isActive = meeting.status === "active";

  const stats = [
    { icon: Calendar, label: "Started", value: new Date(meeting.startedAt).toLocaleString([], {
        month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit",
      }), color: "text-royal-blue" },
    { icon: Clock, label: isActive ? "Duration so far" : "Duration", value: formatDuration(durationMs), color: "text-cyan" },
    { icon: Users, label: "Participants", value: participants.length, color: "text-violet" },
    { icon: MessageSquare, label: "Messages", value: meeting.messageCount ?? 0, color: "text-electric-blue" },
  ];

  return (
    <div className="streamly-bg min-h-screen">
      <Navbar />

      <div className="pointer-events-none fixed top-24 right-10 h-56 w-56 rounded-full bg-cyan/10 blur-3xl animate-float-slow" />

      <main className="max-w-4xl mx-auto px-4 md:px-6 py-10 relative">
        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate("/sessions")}
          whileHover={{ x: -3 }}
          className="flex items-center gap-2 text-sm text-muted hover:text-electric-blue mb-6 transition-colors"
        >
          <ArrowLeft size={16} /> Back to Sessions
        </motion.button>

        {/* Header card */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <GlassCard className="glow-border p-7 relative overflow-hidden mb-6">
            <div className="absolute -top-14 -right-14 h-44 w-44 rounded-full bg-streamly-gradient opacity-20 blur-3xl" />

            <div className="relative flex flex-col sm:flex-row sm:items-start justify-between gap-5">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  <h1 className="text-2xl font-extrabold text-ink tracking-tight">
                    {meeting.title}
                  </h1>
                  {isActive ? (
                    <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                      <Radio size={11} className="animate-glow-pulse" /> Active
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-500">
                      Ended
                    </span>
                  )}
                </div>

                <button
                  onClick={handleCopyId}
                  className="flex items-center gap-1.5 text-sm text-muted hover:text-electric-blue font-mono transition-colors"
                  title="Copy meeting ID"
                >
                  <Hash size={13} /> {meeting.meetingId}
                  <Copy size={12} />
                </button>

                <p className="text-sm text-muted mt-2 flex items-center gap-1.5">
                  <Crown size={13} className="text-cyan" />
                  Hosted by{" "}
                  <span className="font-medium text-ink">
                    {meeting.hostId?.name || "Unknown"}
                  </span>
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleCopyLink}
                  className="px-4 py-2.5 rounded-xl border border-line text-sm font-medium text-ink hover:bg-black/5 hover:border-electric-blue/30 transition-all flex items-center gap-1.5"
                >
                  <Copy size={14} /> Copy Link
                </button>
                {isActive && (
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={handleRejoin}
                    disabled={rejoining}
                    className="px-4 py-2.5 rounded-xl bg-streamly-gradient text-white text-sm font-semibold shadow-md shadow-electric-blue/20 hover:shadow-lg disabled:opacity-70 transition-all flex items-center gap-1.5"
                  >
                    {rejoining ? <Loader2 size={14} className="animate-spin" /> : <Video size={14} />}
                    {rejoining ? "Joining..." : "Re-join"}
                  </motion.button>
                )}
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Stats grid */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
        >
          {stats.map((s) => (
            <GlassCard key={s.label} className="p-5">
              <s.icon size={18} className={s.color} />
              <p className="text-xl font-bold text-ink mt-3">{s.value}</p>
              <p className="text-xs text-muted mt-0.5">{s.label}</p>
            </GlassCard>
          ))}
        </motion.div>

        {/* Participants list */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }}>
          <GlassCard className="p-6">
            <h2 className="font-semibold text-ink mb-4 flex items-center gap-2">
              <Users size={16} className="text-electric-blue" />
              Participants ({participants.length})
            </h2>
            <div className="space-y-1.5">
              {participants.map((p) => {
                const isHost = meeting.hostId && p._id === meeting.hostId._id;
                return (
                  <div
                    key={p._id}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-black/[0.03] transition-colors"
                  >
                   <div
  onClick={() => p.avatar && setSelectedAvatar(p.avatar)}
  className="h-9 w-9 rounded-full bg-electric-blue/10 flex items-center justify-center overflow-hidden shrink-0 cursor-pointer"
>
  {p.avatar ? (
    <img
      src={p.avatar}
      className="h-full w-full object-cover transition-transform duration-200 hover:scale-110"
      alt=""
    />
  ) : (
    <User size={15} className="text-electric-blue" />
  )}
</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-ink truncate flex items-center gap-1.5">
                        {p.name}
                        {isHost && <Crown size={12} className="text-cyan shrink-0" />}
                      </p>
                      <p className="text-xs text-muted truncate">{p.email}</p>
                    </div>
                    {isHost && (
                      <span className="text-[11px] font-semibold text-cyan bg-cyan/10 px-2 py-0.5 rounded-full shrink-0">
                        Host
                      </span>
                    )}
                  </div>
                );
              })}
              {participants.length === 0 && (
                <p className="text-sm text-muted text-center py-6">No participants found.</p>
              )}
            </div>
          </GlassCard>
        </motion.div>
      </main>
      {selectedAvatar && (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    onClick={() => setSelectedAvatar(null)}
    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 cursor-pointer"
  >
    <motion.img
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      src={selectedAvatar}
      alt=""
      onClick={(e) => e.stopPropagation()}
      className="
        w-64 h-64
        sm:w-80 sm:h-80
        md:w-96 md:h-96
        rounded-full
        object-cover
        border-4 border-white/20
        shadow-2xl
        cursor-default
      "
    />
  </motion.div>
)}
    </div>
  );
}