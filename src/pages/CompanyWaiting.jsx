import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useNavigate } from "react-router-dom";

export default function CompanyWaiting() {
  const nav = useNavigate();
  const [status, setStatus] = useState("pending");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data: auth } = await supabase.auth.getUser();
      const uid = auth?.user?.id;
      if (!uid) return nav("/login", { replace: true });

      const { data: row } = await supabase
        .from("company_profiles")
        .select("status")
        .eq("user_id", uid)
        .maybeSingle();

      if (!row) {
        nav("/apply", { replace: true });
        return;
      }

      setStatus(row.status);
      setLoading(false);

      if (row.status === "approved") nav("/company", { replace: true });
    })();
  }, [nav]);

  if (loading) return <div style={{ padding: 24 }}>Loading...</div>;

  return (
    <div style={{ maxWidth: 520, margin: "0 auto", padding: 24 }}>
      <h2>Başvuru Durumu</h2>
      <p>Status: <b>{status}</b></p>
      {status === "pending" && <p>Başvurun incelemede. Owner panelinden onaylanınca otomatik açılacak.</p>}
      {status === "rejected" && <p>Başvurun reddedilmiş. /apply üzerinden tekrar başvurabilirsin.</p>}
    </div>
  );
}
