import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarPlus,
  Calendar,
  Clock,
  Users,
  Copy,
  Pencil,
  X,
  Ban,
  Loader2,
  Video,
  Crown,
} from "lucide-react";
import toast from "react-hot-toast";
import Navbar from "../components/Navbar.jsx";
import GlassCard from "../components/GlassCard.jsx";
import api from "../lib/api";

const DURATION_OPTIONS = [15, 30, 45, 60, 90, 120];

// Combines separate <input type="date"> and <input type="time"> values
// (both interpreted by the browser in the user's local timezone) into a
// single UTC instant. This is what makes scheduling timezone-safe: whatever
// timezone the browser is in, toISOString() always yields the correct
// absolute moment, so a meeting scheduled for "6:00 PM" in Mumbai and one
// scheduled for "6:00 PM" in New York land on two different, correct UTC
// instants rather than being naively compared as strings.
function toIsoUtc(dateStr, timeStr) {
  if (!dateStr || !timeStr) return null;
  const local = new Date(`${dateStr}T${timeStr}`);
  if (Number.isNaN(local.getTime())) return null;
  return local.toISOString();
}

function splitIsoToLocal(iso) {
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, "0");
  const date = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const time = `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  return { date, time };
}

function EditMeetingForm({ meeting, onCancel, onSaved }) {
  const initial = splitIsoToLocal(meeting.scheduledFor);
  const [form, setForm] = useState({
    title: meeting.title,
    description: meeting.description || "",
    date: initial.date,
    time: initial.time,
    durationMinutes: meeting.durationMinutes || 30,
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    const scheduledFor = toIsoUtc(form.date, form.time);
    if (!scheduledFor) {
      toast.error("Please pick a valid date and time.");
      return;
    }
    setSaving(true);
    try {
      const { data } = await api.patch(`/meetings/${meeting.meetingId}/schedule`, {
        title: form.title,
        description: form.description,
        scheduledFor,
        durationMinutes: Number(form.durationMinutes),
      });
      toast.success("Meeting updated.");
      onSaved(data.meeting);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Could not update meeting.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mt-3 pt-3 border-t border-line/60 space-y-3">
      <input
        value={form.title}
        onChange={(e) => setForm({ ...form, title: e.target.value })}
        className="w-full rounded-xl border border-line px-3 py-2 text-sm outline-none focus:border-electric-blue"
        placeholder="Title"
      />
      <textarea
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
        rows={2}
        className="w-full rounded-xl border border-line px-3 py-2 text-sm outline-none focus:border-electric-blue resize-none"
        placeholder="Description (optional)"
      />
      <div className="grid grid-cols-2 gap-3">
        <input
          type="date"
          value={form.date}
          onChange={(e) => setForm({ ...form, date: e.target.value })}
          className="rounded-xl border border-line px-3 py-2 text-sm outline-none focus:border-electric-blue"
        />
        <input
          type="time"
          value={form.time}
          onChange={(e) => setForm({ ...form, time: e.target.value })}
          className="rounded-xl border border-line px-3 py-2 text-sm outline-none focus:border-electric-blue"
        />
      </div>
      <select
        value={form.durationMinutes}
        onChange={(e) => setForm({ ...form, durationMinutes: e.target.value })}
        className="w-full rounded-xl border border-line px-3 py-2 text-sm outline-none focus:border-electric-blue"
      >
        {DURATION_OPTIONS.map((m) => (
          <option key={m} value={m}>
            {m} minutes
          </option>
        ))}
      </select>
      <div className="flex justify-end gap-2">
        <button
          onClick={onCancel}
          className="px-3.5 py-2 rounded-xl text-sm font-medium text-muted hover:bg-black/5"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-3.5 py-2 rounded-xl text-sm font-semibold text-white bg-streamly-gradient shadow-md shadow-electric-blue/20 disabled:opacity-70 flex items-center gap-1.5"
        >
          {saving && <Loader2 size={14} className="animate-spin" />}
          Save changes
        </button>
      </div>
    </div>
  );
}

export default function ScheduleMeeting() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    durationMinutes: 30,
  });
  const [creating, setCreating] = useState(false);
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const loadMeetings = useCallback(async () => {
    try {
      const { data } = await api.get("/meetings/scheduled");
      setMeetings(data.meetings);
    } catch {
      toast.error("Failed to load scheduled meetings.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMeetings();
  }, [loadMeetings]);

  const handleCreate = async (e) => {
    e.preventDefault();
    const scheduledFor = toIsoUtc(form.date, form.time);
    if (!form.title.trim()) {
      toast.error("Please enter a title.");
      return;
    }
    if (!scheduledFor) {
      toast.error("Please pick a valid date and time.");
      return;
    }
    setCreating(true);
    try {
      await api.post("/meetings/schedule", {
        title: form.title.trim(),
        description: form.description.trim(),
        scheduledFor,
        durationMinutes: Number(form.durationMinutes),
      });
      toast.success("Meeting scheduled!");
      setForm({ title: "", description: "", date: "", time: "", durationMinutes: 30 });
      loadMeetings();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Could not schedule meeting.");
    } finally {
      setCreating(false);
    }
  };

  const handleCopyLink = (meetingId) => {
    navigator.clipboard.writeText(`${window.location.origin}/meeting/${meetingId}`);
    toast.success("Meeting link copied!");
  };

  const handleJoin = async (meetingId) => {
    setBusyId(meetingId);
    try {
      await api.post("/meetings/join", { meetingId });
      navigate(`/meeting/${meetingId}`);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Could not join this meeting.");
    } finally {
      setBusyId(null);
    }
  };

  const handleCancel = async (meetingId) => {
    setBusyId(meetingId);
    try {
      await api.post(`/meetings/${meetingId}/cancel`);
      toast.success("Meeting cancelled.");
      loadMeetings();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Could not cancel meeting.");
    } finally {
      setBusyId(null);
    }
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="streamly-bg min-h-screen">
      <Navbar />

      <div className="pointer-events-none fixed top-24 left-10 h-56 w-56 rounded-full bg-cyan/10 blur-3xl animate-float-slow" />

      <main className="max-w-4xl mx-auto px-4 md:px-6 py-10 relative">
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-extrabold text-ink mb-1 tracking-tight flex items-center gap-2"
        >
          <CalendarPlus className="text-electric-blue" size={26} />
          Schedule a meeting
        </motion.h1>
        <p className="text-muted mb-8">Plan ahead and share the link with your team.</p>

        {/* Create form */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <GlassCard className="glow-border p-6 mb-10">
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-ink">Title</label>
                <input
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Weekly team sync"
                  className="mt-1.5 w-full rounded-xl border border-line px-4 py-2.5 text-sm outline-none focus:border-electric-blue focus:ring-2 focus:ring-electric-blue/15 transition-all"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-ink">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={2}
                  placeholder="What's this meeting about? (optional)"
                  className="mt-1.5 w-full rounded-xl border border-line px-4 py-2.5 text-sm outline-none focus:border-electric-blue focus:ring-2 focus:ring-electric-blue/15 transition-all resize-none"
                />
              </div>
              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-ink flex items-center gap-1.5">
                    <Calendar size={13} /> Date
                  </label>
                  <input
                    required
                    type="date"
                    min={today}
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="mt-1.5 w-full rounded-xl border border-line px-4 py-2.5 text-sm outline-none focus:border-electric-blue focus:ring-2 focus:ring-electric-blue/15 transition-all"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-ink flex items-center gap-1.5">
                    <Clock size={13} /> Time
                  </label>
                  <input
                    required
                    type="time"
                    value={form.time}
                    onChange={(e) => setForm({ ...form, time: e.target.value })}
                    className="mt-1.5 w-full rounded-xl border border-line px-4 py-2.5 text-sm outline-none focus:border-electric-blue focus:ring-2 focus:ring-electric-blue/15 transition-all"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-ink">Duration</label>
                  <select
                    value={form.durationMinutes}
                    onChange={(e) => setForm({ ...form, durationMinutes: e.target.value })}
                    className="mt-1.5 w-full rounded-xl border border-line px-4 py-2.5 text-sm outline-none focus:border-electric-blue focus:ring-2 focus:ring-electric-blue/15 transition-all"
                  >
                    {DURATION_OPTIONS.map((m) => (
                      <option key={m} value={m}>
                        {m} minutes
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <p className="text-xs text-muted">
                Times are shown and scheduled in your local timezone —{" "}
                {Intl.DateTimeFormat().resolvedOptions().timeZone}.
              </p>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={creating}
                className="w-full sm:w-auto px-6 py-3 rounded-xl text-white font-semibold bg-streamly-gradient shadow-lg shadow-electric-blue/20 disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {creating ? <Loader2 size={16} className="animate-spin" /> : <CalendarPlus size={16} />}
                {creating ? "Scheduling..." : "Schedule Meeting"}
              </motion.button>
            </form>
          </GlassCard>
        </motion.div>

        {/* Upcoming list */}
        <h2 className="text-xl font-bold text-ink mb-4">Upcoming meetings</h2>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="animate-spin text-electric-blue" size={28} />
          </div>
        ) : meetings.length === 0 ? (
          <GlassCard className="p-10 text-center text-muted">
            No scheduled meetings yet — plan one using the form above.
          </GlassCard>
        ) : (
          <div className="space-y-4">
            {meetings.map((m, i) => (
              <motion.div
                key={m.meetingId}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <GlassCard
                  className={`p-5 ${m.status === "cancelled" ? "opacity-60" : "glow-border"}`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="font-semibold text-ink">{m.title}</h3>
                        {m.status === "cancelled" ? (
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-red-100 text-red-600">
                            Cancelled
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-100 text-blue-700">
                            Scheduled
                          </span>
                        )}
                        {m.isHost && <Crown size={13} className="text-cyan" />}
                      </div>
                      {m.description && (
                        <p className="text-sm text-muted mb-2 line-clamp-2">{m.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-muted flex-wrap">
                        <span className="flex items-center gap-1">
                          <Calendar size={12} className="text-royal-blue" />
                          {new Date(m.scheduledFor).toLocaleString([], {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        {m.durationMinutes && (
                          <span className="flex items-center gap-1">
                            <Clock size={12} className="text-cyan" /> {m.durationMinutes} min
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Users size={12} className="text-violet" /> {m.participantCount} invited
                        </span>
                        <span className="font-mono">{m.meetingId}</span>
                      </div>
                    </div>

                    {m.status === "scheduled" && (
                      <div className="flex items-center gap-2 shrink-0 flex-wrap">
                        <button
                          onClick={() => handleCopyLink(m.meetingId)}
                          title="Copy link"
                          className="h-9 w-9 rounded-xl border border-line flex items-center justify-center hover:bg-black/5 transition-colors"
                        >
                          <Copy size={14} className="text-ink" />
                        </button>
                        {m.isHost && (
                          <>
                            <button
                              onClick={() => setEditingId(editingId === m.meetingId ? null : m.meetingId)}
                              title="Edit"
                              className="h-9 w-9 rounded-xl border border-line flex items-center justify-center hover:bg-black/5 transition-colors"
                            >
                              {editingId === m.meetingId ? (
                                <X size={14} className="text-ink" />
                              ) : (
                                <Pencil size={14} className="text-ink" />
                              )}
                            </button>
                            <button
                              onClick={() => handleCancel(m.meetingId)}
                              disabled={busyId === m.meetingId}
                              title="Cancel meeting"
                              className="h-9 w-9 rounded-xl border border-red-200 flex items-center justify-center hover:bg-red-50 transition-colors disabled:opacity-50"
                            >
                              <Ban size={14} className="text-red-500" />
                            </button>
                          </>
                        )}
                        <motion.button
                          whileHover={{ scale: 1.04 }}
                          whileTap={{ scale: 0.96 }}
                          onClick={() => handleJoin(m.meetingId)}
                          disabled={busyId === m.meetingId}
                          className="px-4 py-2 rounded-xl bg-streamly-gradient text-white text-sm font-semibold shadow-md shadow-electric-blue/20 disabled:opacity-70 flex items-center gap-1.5"
                        >
                          {busyId === m.meetingId ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <Video size={14} />
                          )}
                          Join
                        </motion.button>
                      </div>
                    )}
                  </div>

                  <AnimatePresence>
                    {editingId === m.meetingId && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                      >
                        <EditMeetingForm
                          meeting={m}
                          onCancel={() => setEditingId(null)}
                          onSaved={() => {
                            setEditingId(null);
                            loadMeetings();
                          }}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}