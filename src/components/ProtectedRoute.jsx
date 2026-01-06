import { Navigate } from "react-router-dom";
import { useSession } from "../lib/session";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useSession();

  if (loading) return null; // istersen spinner
  if (!user) return <Navigate to="/login" replace />;

  return children;
}
