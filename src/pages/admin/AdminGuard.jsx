import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function AdminGuard({ children }) {
  const { user, loading } = useAuth();
const { data: admin } = await supabase
  .from("app_admins")
  .select("user_id")
  .eq("user_id", user.id)
  .single();

if (!admin) {
  return <Navigate to="/" replace />;
}
  if (loading) return null;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== "admin" && user.role !== "god") {
    return <Navigate to="/" replace />;
  }

  return children;
}
