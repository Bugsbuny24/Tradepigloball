import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../lib/auth";

export default function RequireRole({ allow = [], children }) {
  const { user, loading } = useAuth();
  const [role, setRole] = useState(null);
  const [busy, setBusy] = useState(true);

  useEffect(() => {
    if (!user) {
      setBusy(false);
      return;
    }
    (async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (error) {
        setRole(null);
      } else {
        setRole(data?.role ?? null);
      }
      setBusy(false);
    })();
  }, [user]);

  if (loading || busy) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (allow.length > 0 && !allow.includes(role)) return <Navigate to="/" replace />;

  return children;
}
