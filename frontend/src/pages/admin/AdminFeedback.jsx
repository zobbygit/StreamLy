import { useEffect, useState, useCallback } from "react";
import { Star, ChevronLeft, ChevronRight, MessageCircle } from "lucide-react";
import api from "../../lib/api";

function StarRow({ rating }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={13}
          className={n <= rating ? "fill-yellow-400 text-yellow-400" : "text-white/15"}
        />
      ))}
    </div>
  );
}

export default function AdminFeedback() {
  const [feedback, setFeedback] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [minRating, setMinRating] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/admin/feedback", {
        params: { page, limit: 15, minRating: minRating || undefined },
      });
      setFeedback(data.feedback);
      setTotalPages(data.totalPages);
      setAverageRating(data.averageRating);
      setTotalCount(data.totalCount);
    } finally {
      setLoading(false);
    }
  }, [page, minRating]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-1">Feedback</h1>
      <p className="text-white/50 text-sm mb-6">
        Post-call ratings and comments submitted by users after leaving a meeting.
      </p>

      <div className="grid sm:grid-cols-2 gap-5 max-w-xl mb-6">
        <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
          <Star size={22} className="text-yellow-400" />
          <p className="text-3xl font-bold text-white mt-4">
            {averageRating ? averageRating.toFixed(2) : "—"}
          </p>
          <p className="text-sm text-white/50 mt-1">Average rating</p>
        </div>
        <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
          <MessageCircle size={22} className="text-electric-blue" />
          <p className="text-3xl font-bold text-white mt-4">{totalCount}</p>
          <p className="text-sm text-white/50 mt-1">Total responses</p>
        </div>
      </div>

      <div className="mb-5">
        <select
          value={minRating}
          onChange={(e) => {
            setPage(1);
            setMinRating(e.target.value);
          }}
          className="px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white outline-none"
        >
          <option value="">All ratings</option>
          <option value="5">5 stars</option>
          <option value="4">4 stars & up</option>
          <option value="3">3 stars & up</option>
          <option value="2">2 stars & up</option>
          <option value="1">1 star & up</option>
        </select>
      </div>

      <div className="rounded-2xl border border-white/10 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-white/5 text-white/50 text-xs uppercase">
            <tr>
              <th className="text-left px-5 py-3 font-medium">User</th>
              <th className="text-left px-5 py-3 font-medium">Meeting</th>
              <th className="text-left px-5 py-3 font-medium">Rating</th>
              <th className="text-left px-5 py-3 font-medium">Comment</th>
              <th className="text-left px-5 py-3 font-medium">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              <tr>
                <td colSpan={5} className="text-center text-white/40 py-8">
                  Loading...
                </td>
              </tr>
            ) : feedback.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center text-white/40 py-8">
                  No feedback submitted yet.
                </td>
              </tr>
            ) : (
              feedback.map((f) => (
                <tr key={f._id} className="text-white/80 hover:bg-white/[0.03] align-top">
                  <td className="px-5 py-3">
                    <div className="flex flex-col">
                      <span>{f.userId?.name || "Deleted user"}</span>
                      <span className="text-xs text-white/40">{f.userId?.email || "—"}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex flex-col">
                      <span>{f.meetingId?.title || "—"}</span>
                      <span className="text-xs text-white/40 font-mono">
                        {f.meetingId?.meetingId || "—"}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <StarRow rating={f.rating} />
                  </td>
                  <td className="px-5 py-3 max-w-xs">
                    <p className="text-white/70 line-clamp-3">{f.comment || "—"}</p>
                  </td>
                  <td className="px-5 py-3 text-white/50 whitespace-nowrap">
                    {new Date(f.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between mt-4">
        <p className="text-xs text-white/40">
          Page {page} of {totalPages}
        </p>
        <div className="flex items-center gap-2">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="p-2 rounded-lg bg-white/5 border border-white/10 disabled:opacity-30"
          >
            <ChevronLeft size={14} className="text-white" />
          </button>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="p-2 rounded-lg bg-white/5 border border-white/10 disabled:opacity-30"
          >
            <ChevronRight size={14} className="text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}