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

      const { data, error } = await supabase
        .from("company_applications")
        .select("company_name,status,admin_note,created_at,updated_at")
        .eq("user_id", uid)
        .order("created_at", { ascending: false })
        .limit(1);

      if (error) {
        console.error(error);
        setRow(null);
      } else {
        setRow((data || [])[0] || null);
      }

      setLoading(false);
    })();
  }, [nav]);

  if (loading) return <div style={{ padding: 24 }}>Loading...</div>;

  return (
    <div style={{ maxWidth: 720, margin: "24px auto", padding: 16 }}>
      <h2>Company Status</h2>

      {!row ? (
        <div style={{ lineHeight: 1.8 }}>
          <div>Başvurun yok.</div>
          <button onClick={() => nav("/company/apply")} style={{ marginTop: 10, padding: 10, borderRadius: 10 }}>
            Apply
          </button>
        </div>
      ) : (
        <div style={{ marginTop: 12, lineHeight: 1.8 }}>
          <div><b>Company:</b> {row.company_name}</div>
          <div><b>Status:</b> {row.status}</div>
          {row.admin_note ? <div><b>Note:</b> {row.admin_note}</div> : null}
          <div style={{ opacity: 0.7, marginTop: 8 }}>
            Onaylanınca “Companies (Verified Stands)” listesine düşer ve stand public görünür.
          </div>
        </div>
      )}
    </div>
  );
}
