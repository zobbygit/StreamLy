import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center streamly-bg">
        <div className="h-10 w-10 rounded-full border-4 border-electric-blue/20 border-t-electric-blue animate-spin" />
      </div>
    );
  }

  if (!user || user.role !== "user") {
    return <Navigate to="/login" replace />;
  }

  return children;
}
