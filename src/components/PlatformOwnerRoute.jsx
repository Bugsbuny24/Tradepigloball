import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

/**
 * /owner için koruma:
 * platform_owners tablosunda user_id kaydı olan erişir.
 */
export default function PlatformOwnerRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const { data: userRes, error: userErr } = await supabase.auth.getUser();
        const user = userRes?.user;

        if (cancelled) return;

        if (userErr || !user) {
          setAllowed(false);
          setLoading(false);
          return;
        }

        const { data: row, error: ownerErr } = await supabase
          .from("platform_owners")
          .select("user_id")
          .eq("user_id", user.id)
          .maybeSingle();

        if (cancelled) return;

        setAllowed(!ownerErr && !!row);
        setLoading(false);
      } catch (e) {
        if (cancelled) return;
        setAllowed(false);
        setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div style={{ padding: 24, color: "#fff", fontFamily: "system-ui" }}>
        Checking owner access...
      </div>
    );
  }

  if (!allowed) return <Navigate to="/login" replace />;
  return children;
}
