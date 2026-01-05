import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export default function PlatformOwnerRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const [hasSession, setHasSession] = useState(false);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    let alive = true;

    const check = async () => {
      try {
        setLoading(true);

        // Session / user kontrol
        const { data: userRes, error: userErr } = await supabase.auth.getUser();
        const user = userRes?.user;

        if (!user || userErr) {
          if (!alive) return;
          setHasSession(false);
          setIsOwner(false);
          setLoading(false);
          return;
        }

        if (!alive) return;
        setHasSession(true);

        // Owner kontrol (DB’den)
        const { data, error } = await supabase
          .from("platform_owners")
          .select("user_id")
          .eq("user_id", user.id)
          .maybeSingle();

        if (!alive) return;
        setIsOwner(!!data && !error);
        setLoading(false);
      } catch (e) {
        console.error("PlatformOwnerRoute check crashed:", e);
        if (!alive) return;
        setHasSession(false);
        setIsOwner(false);
        setLoading(false);
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

  // 🔥 KRİTİK: session yoksa ANA SAYFA DEĞİL LOGIN’E GİDECEK
  if (!hasSession) return <Navigate to="/login" replace />;

  // session var ama owner değilse ana sayfaya
  if (!isOwner) return <Navigate to="/" replace />;

  return children;
}
