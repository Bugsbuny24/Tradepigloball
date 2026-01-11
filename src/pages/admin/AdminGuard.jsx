import { Navigate } from "react-router-dom";

export default function AdminGuard({ user, children }) {
  if (!user || user.role !== "admin") {
    return <Navigate to="/" />;
  }
  return children;
}
