import { useEffect, useState } from "react";
import { MessageSquare, Users } from "lucide-react";
import api from "../../lib/api";

export default function AdminChat() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    (async () => {
      const { data } = await api.get("/admin/chat/stats");
      setStats(data);
    })();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-1">Chat</h1>
      <p className="text-white/50 text-sm mb-8">
        Aggregate messaging statistics. Private message content is never exposed here.
      </p>

      <div className="grid sm:grid-cols-2 gap-5 max-w-xl">
        <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
          <Users size={22} className="text-cyan" />
          <p className="text-3xl font-bold text-white mt-4">{stats ? stats.totalConversations : "—"}</p>
          <p className="text-sm text-white/50 mt-1">Total conversations</p>
        </div>
        <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
          <MessageSquare size={22} className="text-electric-blue" />
          <p className="text-3xl font-bold text-white mt-4">{stats ? stats.totalMessages : "—"}</p>
          <p className="text-sm text-white/50 mt-1">Total messages</p>
        </div>
      </div>

      <div className="mt-8 rounded-2xl bg-white/5 border border-white/10 p-6 max-w-xl">
        <p className="text-sm text-white/50">
          No conversations have been reported yet. Reported conversations will appear here for
          review when reporting is enabled.
        </p>
      </div>
    </div>
  );
}
