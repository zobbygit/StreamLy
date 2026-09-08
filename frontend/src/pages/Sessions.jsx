import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Users, MessageSquare, Calendar, Loader2, Radio, Video } from "lucide-react";
import toast from "react-hot-toast";
import Navbar from "../components/Navbar.jsx";
import GlassCard from "../components/GlassCard.jsx";
import api from "../lib/api";

export default function Sessions() {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rejoining, setRejoining] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/meetings/sessions");
        setSessions(data.sessions);
      } catch {
        toast.error("Failed to load sessions.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleRejoin = async (meetingId) => {
    setRejoining(meetingId);
    try {
      await api.post("/meetings/join", { meetingId });
      navigate(`/meeting/${meetingId}`);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Could not rejoin this meeting.");
    } finally {
      setRejoining(null);
    }
  };

  return (
    <div className="streamly-bg min-h-screen">
      <Navbar />

      <div className="pointer-events-none fixed top-24 right-10 h-56 w-56 rounded-full bg-cyan/10 blur-3xl animate-float-slow" />

      <main className="max-w-5xl mx-auto px-4 md:px-6 py-10 relative">
        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate("/dashboard")}
          whileHover={{ x: -3 }}
          className="flex items-center gap-2 text-sm text-muted hover:text-electric-blue mb-6 transition-colors"
        >
          <ArrowLeft size={16} /> Back to Dashboard
        </motion.button>

        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-extrabold text-ink mb-8 tracking-tight"
        >
          Your sessions
        </motion.h1>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <Loader2 className="animate-spin text-electric-blue" size={32} />
            <p className="text-sm text-muted">Loading your sessions...</p>
          </div>
        ) : sessions.length === 0 ? (
          <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}>
            <GlassCard className="p-14 text-center">
              <div className="h-14 w-14 mx-auto rounded-2xl bg-streamly-gradient opacity-90 flex items-center justify-center mb-4">
                <Video size={22} className="text-white" />
              </div>
              <p className="text-ink font-medium mb-1">No previous meetings</p>
              <p className="text-sm text-muted">Start one from your dashboard to see it here.</p>
            </GlassCard>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {sessions.map((s, i) => (
              <motion.div
                key={s.meetingId}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ y: -3 }}
              >
                <GlassCard
                  className={`glow-border p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-shadow ${
                    s.status === "active"
                      ? "shadow-[0_0_0_1px_rgba(34,197,94,0.25),0_10px_30px_-10px_rgba(34,197,94,0.25)]"
                      : "opacity-90"
                  }`}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <h3 className="font-semibold text-ink">{s.title}</h3>
                      {s.status === "active" ? (
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-green-100 text-green-700">
                          <Radio size={10} className="animate-glow-pulse" /> Active
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-500">
                          Ended
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted font-mono mb-2">{s.meetingId}</p>
                    <div className="flex items-center gap-4 text-xs text-muted flex-wrap">
                      <span className="flex items-center gap-1">
                        <Calendar size={12} className="text-royal-blue" />
                        {new Date(s.startedAt).toLocaleString([], {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users size={12} className="text-cyan" /> {s.participantCount} Participants
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare size={12} className="text-violet" /> {s.messageCount} Messages
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                 <button
  onClick={() => navigate(`/sessions/${s.meetingId}`)}
  className="px-4 py-2 rounded-xl border border-line text-sm font-medium text-ink hover:bg-black/5 hover:border-electric-blue/30 transition-all"
>
  View Details
</button>
                    {s.status === "active" && (
                      <motion.button
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.96 }}
                        onClick={() => handleRejoin(s.meetingId)}
                        disabled={rejoining === s.meetingId}
                        className="px-4 py-2 rounded-xl bg-streamly-gradient text-white text-sm font-semibold shadow-md shadow-electric-blue/20 hover:shadow-lg disabled:opacity-70 transition-all"
                      >
                        {rejoining === s.meetingId ? "Joining..." : "Re-join"}
                      </motion.button>
                    )}
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}