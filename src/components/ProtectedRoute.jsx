import { Navigate } from "react-router-dom";
import { useSession } from "../lib/session";

export default function ProtectedRoute({ children }) {
  const { session, loading } = useSession();

  if (loading) {
    return <div style={{ padding: 20 }}>Loading...</div>;
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
