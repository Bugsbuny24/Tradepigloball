import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export default function PlatformOwnerRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const [ok, setOk] = useState(false);

  useEffect(() => {
    let mounted = true;

    (async () => {
      const { data, error } = await supabase.auth.getUser();
      if (!mounted) return;

      if (error || !data?.user) {
        setOk(false);
        setLoading(false);
        return;
      }

      // DB tablosu ile kontrol: platform_owners
      const { data: row, error: e2 } = await supabase
        .from("platform_owners")
        .select("user_id")
        .eq("user_id", data.user.id)
        .maybeSingle();

      setOk(!e2 && !!row);
      setLoading(false);
    })();

    return () => { mounted = false; };
  }, []);

  if (loading) return <div style={{ padding: 24, color: "#fff" }}>Loading...</div>;
  if (!ok) return <Navigate to="/login" replace />;

  return children;
}
