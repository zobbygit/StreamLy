import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { Loader2 } from "lucide-react";
import api from "../../lib/api";

function ChartCard({ title, data, color }) {
  return (
    <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
      <h3 className="text-white font-semibold mb-4">{title}</h3>
      {data.length === 0 ? (
        <p className="text-sm text-white/40 py-16 text-center">No data in this range.</p>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
            <XAxis dataKey="date" stroke="rgba(255,255,255,0.4)" fontSize={11} />
            <YAxis stroke="rgba(255,255,255,0.4)" fontSize={11} allowDecimals={false} />
            <Tooltip
              contentStyle={{
                background: "#07111F",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 12,
                color: "#fff",
                fontSize: 12,
              }}
            />
            <Line type="monotone" dataKey="count" stroke={color} strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

export default function AdminAnalytics() {
  const [days, setDays] = useState(14);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    api
      .get("/admin/analytics", { params: { days } })
      .then(({ data }) => setData(data))
      .catch(() => setError("Failed to load analytics."))
      .finally(() => setLoading(false));
  }, [days]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Analytics</h1>
          <p className="text-white/50 text-sm">Registrations, meetings, and chat activity over time.</p>
        </div>
        <select
          value={days}
          onChange={(e) => setDays(Number(e.target.value))}
          className="px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white outline-none"
        >
          <option value={7}>Last 7 days</option>
          <option value={14}>Last 14 days</option>
          <option value={30}>Last 30 days</option>
          <option value={90}>Last 90 days</option>
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-cyan" size={28} />
        </div>
      ) : error ? (
        <p className="text-red-400 text-sm">{error}</p>
      ) : (
        <div className="grid lg:grid-cols-2 gap-5">
          <ChartCard title="User registrations" data={data.registrations} color="#06B6D4" />
          <ChartCard title="Meetings created" data={data.meetingsCreated} color="#2563EB" />
          <ChartCard title="Chat activity" data={data.chatActivity} color="#7C3AED" />
        </div>
      )}
    </div>
  );
}
