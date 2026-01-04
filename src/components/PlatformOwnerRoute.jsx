import { Navigate } from "react-router-dom";
import useMe from "../lib/useMe";

export default function PlatformOwnerRoute({ children }) {
  const { loading, user, profile } = useMe();

  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (profile?.role !== "owner") return <Navigate to="/" replace />;

  return children;
}
