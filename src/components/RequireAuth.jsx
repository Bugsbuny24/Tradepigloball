import React from "react";
import { Navigate } from "react-router-dom";
import useMe from "../lib/useMe";

export default function RequireAuth({ children }) {
  const { loading, user } = useMe();
  if (loading) return <div style={{ padding: 20 }}>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}
