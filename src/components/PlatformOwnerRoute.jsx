import { Navigate } from "react-router-dom";
import useMe from "../lib/useMe";

export default function PlatformOwnerRoute({ children }) {
  const { me, loading } = useMe();

  if (loading) return <div style={{ padding: 24 }}>Loading...</div>;
  if (!me?.id) return <Navigate to="/login" replace />;
  if (me?.role !== "owner") return <div style={{ padding: 24 }}>Yetkisiz.</div>;

  return children;
}
