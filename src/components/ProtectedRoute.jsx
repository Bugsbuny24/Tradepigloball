import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../lib/auth";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return null; // istersen loader koyarız
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;

  return children;
}
