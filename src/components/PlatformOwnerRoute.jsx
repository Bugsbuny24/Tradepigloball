import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export default function PlatformOwnerRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    let alive = true;

    const check = async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u?.user) {
        if (alive) { setAllowed(false); setLoading(false); }
        return;
      }

      const { data, error } = await supabase.rpc("is_platform_owner");
      if (alive) {
        setAllowed(!!data && !error);
        setLoading(false);
      }
    };

    check();
    const { data: sub } = supabase.auth.onAuthStateChange(() => check());
    return () => sub?.subscription?.unsubscribe?.();
  }, []);

  if (loading) return <div style={{ padding: 24 }}>Loading...</div>;
  if (!allowed) return <Navigate to="/" replace />;
  return children;
}
