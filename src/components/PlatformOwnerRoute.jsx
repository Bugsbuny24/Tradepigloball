import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export default function PlatformOwnerRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const [allowed, setAllowed] = useState(false);
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    let alive = true;

    const check = async () => {
      try {
        setLoading(true);

        const { data: userRes, error: userErr } = await supabase.auth.getUser();
        const user = userRes?.user;

        if (userErr) console.error("getUser error:", userErr);

        if (!user) {
          if (alive) {
            setHasSession(false);
            setAllowed(false);
            setLoading(false);
          }
          return;
        }

        if (alive) setHasSession(true);

        // ✅ owner check: platform_owners tablosunda var mı?
        const { data, error } = await supabase
          .from("platform_owners")
          .select("user_id")
          .eq("user_id", user.id)
          .maybeSingle();

        if (error) {
          console.error("owner check error:", error);
        }

        if (alive) {
          setAllowed(!!data && !error);
          setLoading(false);
        }
      } catch (e) {
        console.error("PlatformOwnerRoute check crashed:", e);
        if (alive) {
          setAllowed(false);
          setHasSession(false);
          setLoading(false);
        }
      }
    };

    check();

    const { data: sub } = supabase.auth.onAuthStateChange(() => check());

    return () => {
      alive = false;
      sub?.subscription?.unsubscribe?.();
    };
  }, []);

  if (loading) return <div style={{ padding: 24 }}>Loading...</div>;

  // session yoksa: login sayfasına ya da ana sayfaya yönlendir (sen nasıl istiyorsan)
  if (!hasSession) return <Navigate to="/" replace />;

  // session var ama owner değilse: ana sayfaya
  if (!allowed) return <Navigate to="/" replace />;

  return children;
}
