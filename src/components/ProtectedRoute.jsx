import { Navigate, useLocation } from "react-router-dom";
import { useSession } from "../lib/session";

export default function ProtectedRoute({ children }) {
  const { session, loading } = useSession();
  const location = useLocation();

  if (loading) return null; // istersen loader koyarız
  if (!session) return <Navigate to="/login" replace state={{ from: location.pathname }} />;

  return children;
}
