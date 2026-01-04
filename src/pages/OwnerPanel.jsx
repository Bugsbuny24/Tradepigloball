import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function OwnerPanel() {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);
  const [err, setErr] = useState("");

  async function load() {
    setLoading(true);
    setErr("");

    const { data, error } = await supabase
      .from("company_profiles")
      .select("user_id, company_name, country, city, website, status, is_verified, owner_id, created_at, updated_at")
      .order("created_at", { ascending: false });

    if (error) setErr(error.message);
    else setRows(data ?? []);

    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function approve(user_id) {
    const { error } = await supabase
      .from("company_profiles")
      .update({
        status: "approved",
        is_verified: true,
        owner_id: (await supabase.auth.getUser()).data.user.id,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user_id);

    if (error) return alert(error.message);
    alert("Approved ✅");
    load();
  }

  async function reject(user_id) {
    const ok = confirm("Reject? (status=rejected)");
    if (!ok) return;

    const { error } = await supabase
      .from("company_profiles")
      .update({
        status: "rejected",
        is_verified: false,
        owner_id: (await supabase.auth.getUser()).data.user.id,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user_id);

    if (error) return alert(error.message);
    alert("Rejected ❌");
    load();
  }

  return (
    <div style={{ padding: 20, maxWidth: 1000, margin: "0 auto" }}>
      <h2>Owner Panel • Company Approvals</h2>

      <div style={{ margin: "12px 0" }}>
        <button onClick={load} disabled={loading}>Refresh</button>
      </div>

      {err && <div style={{ color: "crimson", marginBottom: 12 }}>Error: {err}</div>}
      {loading && <div>Loading…</div>}

      {!loading && rows.length === 0 && <div>No companies yet.</div>}

      {!loading && rows.map((c) => (
        <div key={c.user_id} style={{ border: "1px solid #ddd", borderRadius: 12, padding: 12, marginBottom: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
            <div>
              <div><b>{c.company_name}</b> <span style={{ opacity: 0.7 }}>({c.status})</span></div>
              <div style={{ fontSize: 12, opacity: 0.75 }}>user_id: {c.user_id}</div>
              <div style={{ fontSize: 12, opacity: 0.75 }}>
                {c.country || "-"} / {c.city || "-"} • {c.website || "-"}
              </div>
              <div style={{ fontSize: 12, opacity: 0.6 }}>
                created: {new Date(c.created_at).toLocaleString()} • updated: {new Date(c.updated_at).toLocaleString()}
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8, minWidth: 180 }}>
              <button onClick={() => approve(c.user_id)} disabled={c.status !== "pending"}>Approve</button>
              <button onClick={() => reject(c.user_id)} disabled={c.status !== "pending"}>Reject</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
