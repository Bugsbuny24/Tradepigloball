import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function OwnerPanel() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [err, setErr] = useState("");

  async function load() {
    setLoading(true);
    setErr("");

    const { data, error } = await supabase
      .from("seller_requests")
      .select("id, requester_id, company_name, message, status, created_at, reviewed_at, reject_reason")
      .order("created_at", { ascending: false });

    if (error) setErr(error.message);
    else setItems(data || []);

    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function approve(id) {
    const { error } = await supabase.rpc("approve_seller_request", { p_request_id: id });
    if (error) return alert(error.message);
    alert("Approved ✅");
    load();
  }

  async function reject(id) {
    const reason = prompt("Reject reason?");
    if (reason === null) return;

    // Eğer reject RPC yoksa direkt update ile reddediyoruz
    const { error } = await supabase
      .from("seller_requests")
      .update({
        status: "rejected",
        reject_reason: reason,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) return alert(error.message);
    alert("Rejected ❌");
    load();
  }

  return (
    <div style={{ padding: 16, maxWidth: 900, margin: "0 auto" }}>
      <h2>Owner Panel</h2>

      <div style={{ marginBottom: 12 }}>
        <button onClick={load} disabled={loading}>Refresh</button>
      </div>

      {err && <div style={{ color: "crimson", marginBottom: 12 }}>{err}</div>}
      {loading && <div>Loading...</div>}

      {!loading && items.length === 0 && <div>No requests yet.</div>}

      {!loading && items.map((x) => (
        <div key={x.id} style={{ border: "1px solid #ddd", borderRadius: 10, padding: 12, marginBottom: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
            <div>
              <b>{x.company_name}</b> <span style={{ opacity: 0.7 }}>({x.status})</span>
              <div style={{ fontSize: 12, opacity: 0.7 }}>Request ID: {x.id}</div>
              <div style={{ fontSize: 12, opacity: 0.7 }}>Requester: {x.requester_id}</div>
              {x.message && <div style={{ marginTop: 6 }}>{x.message}</div>}
              {x.reject_reason && <div style={{ marginTop: 6, color: "crimson" }}>Reason: {x.reject_reason}</div>}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8, minWidth: 160 }}>
              <button
                onClick={() => approve(x.id)}
                disabled={x.status !== "pending"}
              >
                Approve
              </button>
              <button
                onClick={() => reject(x.id)}
                disabled={x.status !== "pending"}
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
          }
