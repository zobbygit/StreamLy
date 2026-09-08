import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function AdminRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-midnight-navy">
        <div className="h-10 w-10 rounded-full border-4 border-cyan/20 border-t-cyan animate-spin" />
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}
