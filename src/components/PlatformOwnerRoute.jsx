import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export default function PlatformOwnerRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const [ok, setOk] = useState(false);
  const [hasUser, setHasUser] = useState(false);

  useEffect(() => {
    let mounted = true;

    (async () => {
      const { data, error } = await supabase.auth.getUser();

      if (!mounted) return;

      if (error || !data?.user) {
        setHasUser(false);
        setOk(false);
        setLoading(false);
        return;
      }

      setHasUser(true);

      // DB tablosu ile kontrol: platform_owners
      const { data: row, error: e2 } = await supabase
        .from("platform_owners")
        .select("user_id")
        .eq("user_id", data.user.id)
        .maybeSingle();

      if (!mounted) return;

      setOk(!e2 && !!row);
      setLoading(false);
    })();

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) return <div style={{ padding: 24, color: "#fff" }}>Loading...</div>;

  // giriş yoksa login
  if (!hasUser) return <Navigate to="/login" replace />;

  // giriş var ama owner değil -> ana sayfaya kaç (gizli)
  if (!ok) return <Navigate to="/" replace />;

  return <>{children}</>;
}
