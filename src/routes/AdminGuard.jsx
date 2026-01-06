import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function AdminGuard() {
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const { data: { session }, error: sErr } = await supabase.auth.getSession();
        if (sErr) throw sErr;

        if (!session?.user) {
          if (!alive) return;
          setAuthed(false);
          setLoading(false);
          return;
        }

        setAuthed(true);

        const userId = session.user.id;

        const { data: profile, error: pErr } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", userId)
          .maybeSingle();

        if (pErr) throw pErr;

        if (!alive) return;
        setIsOwner(profile?.role === "owner");
        setLoading(false);
      } catch (e) {
        if (!alive) return;
        setErr(e?.message || String(e));
        setLoading(false);
      }
    })();

    return () => { alive = false; };
  }, []);

  if (loading) {
    return (
      <div style={{ padding: 24 }}>
        <h3>Admin yükleniyor…</h3>
        <p>Session / profile kontrol ediliyor.</p>
      </div>
    );
  }

  if (err) {
    return (
      <div style={{ padding: 24 }}>
        <h3>Hata</h3>
        <pre style={{ whiteSpace: "pre-wrap" }}>{err}</pre>
      </div>
    );
  }

  if (!authed) return <Navigate to="/login" replace />;
  if (!isOwner) return <Navigate to="/" replace />;

  return <Outlet />;
}
