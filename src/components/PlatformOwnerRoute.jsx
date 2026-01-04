import { Navigate } from "react-router-dom";
import useMe from "../lib/useMe";

export default function PlatformOwnerRoute({ children }) {
  const { loading, user, profile } = useMe();

  if (loading) return <div style={{ padding: 24, color: "#fff" }}>Loading...</div>;

  // login yoksa -> login
  if (!user) return <Navigate to="/login" replace />;

  // owner değilse -> ana sayfa
  if (profile?.role !== "owner") return <Navigate to="/" replace />;

  return children;
}
