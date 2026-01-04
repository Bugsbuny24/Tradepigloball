import React from "react";
import { Navigate } from "react-router-dom";
import { useMe } from "../lib/useMe";

export default function RequireAuth({ children }) {
  const { loading, session } = useMe();
  if (loading) return <div style={{ padding: 20 }}>Loading...</div>;
  if (!session) return <Navigate to="/login" replace />;
  return children;
}
