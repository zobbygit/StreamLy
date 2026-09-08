import { useEffect, useState, useCallback } from "react";
import { Search, ChevronLeft, ChevronRight, Ban, CheckCircle, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../lib/api";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/admin/users", { params: { search, page, limit: 10 } });
      setUsers(data.users);
      setTotalPages(data.totalPages);
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  useEffect(() => {
    load();
  }, [load]);

  const toggleStatus = async (u) => {
    const nextStatus = u.accountStatus === "active" ? "deactivated" : "active";
    try {
      await api.patch(`/admin/users/${u._id}/status`, { status: nextStatus });
      toast.success(`User ${nextStatus === "active" ? "activated" : "deactivated"}.`);
      load();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Action failed.");
    }
  };

  const handleDelete = async (u) => {
    try {
      await api.delete(`/admin/users/${u._id}`);
      toast.success("User deleted.");
      setConfirmDelete(null);
      load();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Delete failed.");
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-1">Users</h1>
      <p className="text-white/50 text-sm mb-6">Search, manage, and moderate user accounts.</p>

      <div className="relative mb-5 max-w-sm">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
        <input
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
          placeholder="Search name or email..."
          className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white outline-none focus:border-cyan/50"
        />
      </div>

      <div className="rounded-2xl border border-white/10 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-white/5 text-white/50 text-xs uppercase">
            <tr>
              <th className="text-left px-5 py-3 font-medium">Name</th>
              <th className="text-left px-5 py-3 font-medium">Email</th>
              <th className="text-left px-5 py-3 font-medium">Status</th>
              <th className="text-left px-5 py-3 font-medium">Joined</th>
              <th className="text-right px-5 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              <tr>
                <td colSpan={5} className="text-center text-white/40 py-8">
                  Loading...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center text-white/40 py-8">
                  No users found.
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u._id} className="text-white/80 hover:bg-white/[0.03]">
                  <td className="px-5 py-3">{u.name}</td>
                  <td className="px-5 py-3">{u.email}</td>
                  <td className="px-5 py-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        u.accountStatus === "active"
                          ? "bg-green-500/15 text-green-400"
                          : "bg-red-500/15 text-red-400"
                      }`}
                    >
                      {u.accountStatus}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-white/50">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => toggleStatus(u)}
                        title={u.accountStatus === "active" ? "Deactivate" : "Activate"}
                        className="p-1.5 rounded-lg hover:bg-white/10"
                      >
                        {u.accountStatus === "active" ? (
                          <Ban size={15} className="text-yellow-400" />
                        ) : (
                          <CheckCircle size={15} className="text-green-400" />
                        )}
                      </button>
                      <button
                        onClick={() => setConfirmDelete(u)}
                        title="Delete"
                        className="p-1.5 rounded-lg hover:bg-white/10"
                      >
                        <Trash2 size={15} className="text-red-400" />
                      </button>
                    </div>
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

      {confirmDelete && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
          <div className="bg-midnight-navy border border-white/10 rounded-2xl p-6 max-w-sm w-full">
            <h3 className="text-white font-semibold mb-2">Delete this user?</h3>
            <p className="text-sm text-white/60 mb-6">
              This will permanently delete <span className="text-white">{confirmDelete.email}</span>.
              This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="px-4 py-2 rounded-xl text-sm text-white/70 hover:bg-white/5"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(confirmDelete)}
                className="px-4 py-2 rounded-xl text-sm bg-red-600 hover:bg-red-500 text-white font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
