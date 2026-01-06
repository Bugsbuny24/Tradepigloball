import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export default function AdminGuard({ children }) {
  const [loading, setLoading] = useState(true);
  const [ok, setOk] = useState(false);

  useEffect(() => {
    let alive = true;

    (async () => {
      const { data: u } = await supabase.auth.getUser();
      const user = u?.user;

      if (!user) {
        if (!alive) return;
        setOk(false);
        setLoading(false);
        return;
      }

      const { data: row } = await supabase
        .from("app_admins")
        .select("user_id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!alive) return;
      setOk(!!row);
      setLoading(false);
    })();

    return () => (alive = false);
  }, []);

  if (loading) return <div style={{ padding: 20 }}>Admin loading…</div>;
  if (!ok) return <Navigate to="/" replace />;
  return children;
    }
