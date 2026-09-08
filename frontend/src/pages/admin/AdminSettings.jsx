import { useAuth } from "../../context/AuthContext.jsx";

export default function AdminSettings() {
  const { user } = useAuth();

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-1">Settings</h1>
      <p className="text-white/50 text-sm mb-8">Admin account details.</p>

      <div className="rounded-2xl bg-white/5 border border-white/10 p-6 max-w-lg space-y-4">
        <div>
          <p className="text-xs text-white/40">Name</p>
          <p className="text-white font-medium">{user?.name}</p>
        </div>
        <div>
          <p className="text-xs text-white/40">Email</p>
          <p className="text-white font-medium">{user?.email}</p>
        </div>
        <div>
          <p className="text-xs text-white/40">Role</p>
          <p className="text-white font-medium capitalize">{user?.role}</p>
        </div>
        <p className="text-xs text-white/40 pt-2 border-t border-white/10">
          Admin credentials are provisioned via environment variables (ADMIN_EMAIL /
          ADMIN_PASSWORD) at first boot. Rotate them by updating your .env and re-seeding.
        </p>
      </div>
    </div>
  );
}
