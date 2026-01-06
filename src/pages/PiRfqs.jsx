import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import TopBar from "../components/TopBar";
import { supabase } from "../lib/supabaseClient";

export default function PiRfqs() {
  const nav = useNavigate();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  const load = async () => {
    setLoading(true);
    setErr(null);
    const { data, error } = await supabase
      .from("rfqs")
      .select("id,title,country,budget_pi,deadline,status,created_at,owner_id")
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) {
      setErr(error.message);
      setRows([]);
    } else {
      setRows(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div style={{ padding: 24, color: "#fff" }}>
      <TopBar title="PI • RFQs" />

      <div style={{ display: "flex", gap: 12, margin: "12px 0 20px" }}>
        <button onClick={() => nav("/pi/rfq/create")}>Create RFQ</button>
        <button onClick={() => nav("/pi/products")}>Products</button>
        <button onClick={load}>Refresh</button>
      </div>

      {loading ? (
        <p>Loading…</p>
      ) : err ? (
        <pre style={{ whiteSpace: "pre-wrap", background: "#111", padding: 12, borderRadius: 10 }}>
          {err}
        </pre>
      ) : rows.length === 0 ? (
        <p>Henüz RFQ yok.</p>
      ) : (
        <div style={{ display: "grid", gap: 10 }}>
          {rows.map((r) => (
            <button
              key={r.id}
              onClick={() => nav(`/pi/rfqs/${r.id}`)}
              style={{
                textAlign: "left",
                background: "rgba(0,0,0,0.35)",
                padding: 14,
                borderRadius: 14,
                border: "1px solid rgba(255,255,255,0.08)",
                cursor: "pointer",
              }}
            >
              <div style={{ fontSize: 16, fontWeight: 800 }}>{r.title || "(No title)"}</div>
              <div style={{ opacity: 0.85, marginTop: 6 }}>
                {r.country || ""}
                {r.country ? " • " : ""}Budget (Pi): {r.budget_pi ?? "-"}
                {r.deadline ? ` • Deadline: ${r.deadline}` : ""}
              </div>
              <div style={{ opacity: 0.6, marginTop: 6, fontSize: 12 }}>
                Status: {r.status} • {r.created_at ? new Date(r.created_at).toLocaleString() : ""}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
