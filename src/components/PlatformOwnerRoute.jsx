import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export default function PlatformOwnerRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const [ok, setOk] = useState(false);

  useEffect(() => {
    let alive = true;

    (async () => {
      const { data: authData } = await supabase.auth.getUser();
      const user = authData?.user;
      if (!user) {
        if (alive) { setOk(false); setLoading(false); }
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (alive) {
        setOk(!error && String(data?.role) === "owner");
        setLoading(false);
      }
    })();

    return () => { alive = false; };
  }, []);

  if (loading) return <div style={{ padding: 24 }}>Checking owner…</div>;
  if (!ok) return <Navigate to="/login" replace />;
  return children;
}
