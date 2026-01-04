import { Navigate, useLocation } from "react-router-dom";
import useMe from "../lib/useMe";

export default function RequireRole({ allow, children }) {
  const { loading, isAuthed, role } = useMe();
  const loc = useLocation();

  if (loading) return <div>Loading...</div>;

  if (!isAuthed) {
    return <Navigate to="/login" replace state={{ from: loc.pathname }} />;
  }

  if (!allow.includes(role)) {
    if (role === "owner") return <Navigate to="/owner" replace />;
    if (role === "company") return <Navigate to="/company" replace />;
    return <Navigate to="/buyer" replace />;
  }

  return children;
}
