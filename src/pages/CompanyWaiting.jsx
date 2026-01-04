import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export default function CompanyWaiting() {
  const nav = useNavigate();
  const [row, setRow] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: auth } = await supabase.auth.getUser();
      const uid = auth?.user?.id;
      if (!uid) {
        nav("/login", { replace: true });
        return;
      }

      const { data } = await supabase
        .from("company_profiles")
        .select("company_name,status,is_verified")
        .eq("user_id", uid)
        .single();

      setRow(data || null);
      setLoading(false);
    })();
  }, [nav]);

  if (loading) return <div style={{ padding: 24, color: "#fff" }}>Loading...</div>;

  return (
    <div style={{ padding: 24, color: "#fff" }}>
      <h2>Company Status</h2>
      {!row ? (
        <div>
          Company kaydın yok. <button onClick={() => nav("/company/apply")}>Apply</button>
        </div>
      ) : (
        <div style={{ marginTop: 12, lineHeight: 1.8 }}>
          <div><b>Company:</b> {row.company_name}</div>
          <div><b>Status:</b> {row.status}</div>
          <div><b>Verified:</b> {String(row.is_verified)}</div>
        </div>
      )}
    </div>
  );
}
