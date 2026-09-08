import { useEffect, useState } from "react";
import { Users, UserCheck, Video, Radio, CheckCircle2, MessageSquare } from "lucide-react";
import api from "../../lib/api";

const cards = [
  { key: "totalUsers", label: "Total registered users", icon: Users, color: "text-cyan" },
  { key: "activeUsers", label: "Active users", icon: UserCheck, color: "text-green-400" },
  { key: "totalMeetings", label: "Total meetings", icon: Video, color: "text-electric-blue" },
  { key: "activeMeetings", label: "Active meetings", icon: Radio, color: "text-yellow-400" },
  { key: "completedMeetings", label: "Completed meetings", icon: CheckCircle2, color: "text-violet" },
  { key: "totalMessages", label: "Total chat messages", icon: MessageSquare, color: "text-cyan" },
];

export default function AdminOverview() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    (async () => {
      const { data } = await api.get("/admin/overview");
      setStats(data);
    })();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-1">Overview</h1>
      <p className="text-white/50 text-sm mb-8">Platform-wide statistics at a glance.</p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {cards.map(({ key, label, icon: Icon, color }) => (
          <div key={key} className="rounded-2xl bg-white/5 border border-white/10 p-6">
            <Icon size={22} className={color} />
            <p className="text-3xl font-bold text-white mt-4">
              {stats ? stats[key] ?? 0 : "—"}
            </p>
            <p className="text-sm text-white/50 mt-1">{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
