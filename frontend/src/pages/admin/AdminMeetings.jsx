import { useEffect, useState, useCallback } from "react";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import api from "../../lib/api";

export default function AdminMeetings() {
  const [meetings, setMeetings] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/admin/meetings", {
        params: { search, status: status || undefined, page, limit: 10 },
      });
      setMeetings(data.meetings);
      setTotalPages(data.totalPages);
    } finally {
      setLoading(false);
    }
  }, [search, status, page]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-1">Meetings</h1>
      <p className="text-white/50 text-sm mb-6">View and search all meetings on the platform.</p>

      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative max-w-sm flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
            placeholder="Search by meeting ID or title..."
            className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white outline-none focus:border-cyan/50"
          />
        </div>
        <select
          value={status}
          onChange={(e) => {
            setPage(1);
            setStatus(e.target.value);
          }}
          className="px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white outline-none"
        >
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="ended">Ended</option>
        </select>
      </div>

      <div className="rounded-2xl border border-white/10 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-white/5 text-white/50 text-xs uppercase">
            <tr>
              <th className="text-left px-5 py-3 font-medium">Meeting ID</th>
              <th className="text-left px-5 py-3 font-medium">Host</th>
              <th className="text-left px-5 py-3 font-medium">Participants</th>
              <th className="text-left px-5 py-3 font-medium">Status</th>
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
            ) : meetings.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center text-white/40 py-8">
                  No meetings found.
                </td>
              </tr>
            ) : (
              meetings.map((m) => (
                <tr key={m._id} className="text-white/80 hover:bg-white/[0.03]">
                  <td className="px-5 py-3 font-mono text-xs">{m.meetingId}</td>
                  <td className="px-5 py-3">{m.hostId?.name || "—"}</td>
                  <td className="px-5 py-3">{m.participants?.length ?? 0}</td>
                  <td className="px-5 py-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        m.status === "active"
                          ? "bg-green-500/15 text-green-400"
                          : "bg-white/10 text-white/50"
                      }`}
                    >
                      {m.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-white/50">
                    {new Date(m.createdAt).toLocaleString()}
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
