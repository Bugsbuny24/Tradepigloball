import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function OwnerPanel() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const load = async () => {
    setLoading(true);
    setErr("");

    const { data, error } = await supabase
      .from("company_profiles")
      .select("user_id, company_name, country, city, tax_no, status, created_at")
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    if (error) setErr(error.message);
    setRows(data || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const approve = async (user_id) => {
    setErr("");
    const { data: auth } = await supabase.auth.getUser();
    const ownerUid = auth?.user?.id || null;

    const { error } = await supabase
      .from("company_profiles")
      .update({ status: "approved", is_verified: true, owner_id: ownerUid })
      .eq("user_id", user_id)
      .eq("status", "pending");

    if (error) return setErr(error.message);
    load();
  };

  const reject = async (user_id) => {
    const reason = prompt("Reject reason (opsiyonel):") || null;

    const { data: auth } = await supabase.auth.getUser();
    const ownerUid = auth?.user?.id || null;

    const { error } = await supabase
      .from("company_profiles")
      .update({ status: "rejected", is_verified: false, owner_id: ownerUid, reject_reason: reason })
      .eq("user_id", user_id)
      .eq("status", "pending");

    if (error) return setErr(error.message);
    load();
  };

  return (
    <div style={{ padding: 24, maxWidth: 900, margin: "0 auto" }}>
      <h2>Owner Panel</h2>
      <p>Pending company başvuruları</p>

      {err && (
        <div style={{ background: "#ffefef", padding: 12, borderRadius: 8, marginTop: 12 }}>
          {err}
        </div>
      )}

      <button onClick={load} style={{ marginTop: 12 }}>Refresh</button>

      {loading ? (
        <div style={{ marginTop: 16 }}>Loading...</div>
      ) : rows.length === 0 ? (
        <div style={{ marginTop: 16 }}>Bekleyen başvuru yok.</div>
      ) : (
        <div style={{ marginTop: 16, display: "grid", gap: 12 }}>
          {rows.map((r) => (
            <div key={r.user_id} style={{ border: "1px solid #ddd", borderRadius: 10, padding: 12 }}>
              <div><b>{r.company_name}</b></div>
              <div style={{ opacity: 0.8 }}>
                {r.country || "-"} / {r.city || "-"} • Tax: {r.tax_no || "-"}
              </div>
              <div style={{ opacity: 0.7, marginTop: 6 }}>user_id: {r.user_id}</div>

              <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                <button onClick={() => approve(r.user_id)}>Approve</button>
                <button onClick={() => reject(r.user_id)}>Reject</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
