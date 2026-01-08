import React from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../lib/supabaseClient";

function Badge({ tone = "neutral", children }) {
  const bg =
    tone === "ok" ? "rgba(0,255,160,.10)" : tone === "warn" ? "rgba(255,210,0,.12)" : "rgba(255,255,255,.08)";
  const bd =
    tone === "ok" ? "1px solid rgba(0,255,160,.25)" : tone === "warn" ? "1px solid rgba(255,210,0,.28)" : "1px solid rgba(255,255,255,.14)";
  return <span style={{ padding: "6px 10px", borderRadius: 999, background: bg, border: bd, fontSize: 12, fontWeight: 800 }}>{children}</span>;
}

export default function SellerOrders() {
  const nav = useNavigate();
  const [me, setMe] = React.useState(null);
  const [rows, setRows] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [err, setErr] = React.useState("");
  const [tab, setTab] = React.useState("pending"); // pending | paid

  async function load() {
    setLoading(true);
    setErr("");
    const { data: auth } = await supabase.auth.getUser();
    if (!auth?.user) {
      setErr("Login gerekli.");
      setLoading(false);
      return;
    }
    setMe(auth.user);

    const status = tab === "paid" ? "paid" : "pending_payment";

    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("seller_id", auth.user.id)
      .eq("status", status)
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) setErr(error.message);
    setRows(data || []);
    setLoading(false);
  }

  React.useEffect(() => {
    load();
  }, [tab]);

  return (
    <div style={S.page}>
      <div style={S.top}>
        <div>
          <div style={S.h1}>Seller Orders</div>
          <div style={S.sub}>Track orders created from accepted offers. Payment is via Pi Network.</div>
        </div>
        <button onClick={load} style={S.btn}>Refresh</button>
      </div>

      <div style={S.tabs}>
        <Tab active={tab === "pending"} onClick={() => setTab("pending")}>Pending Payment</Tab>
        <Tab active={tab === "paid"} onClick={() => setTab("paid")}>Paid</Tab>
      </div>

      {err ? <div style={S.err}><b>Hata:</b> {err}</div> : null}
      {loading ? <div style={{ marginTop: 10 }}>Loading...</div> : null}

      {!loading && (
        <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
          {rows.length === 0 ? (
            <div style={S.empty}>No orders.</div>
          ) : (
            rows.map((o) => (
              <div key={o.id} style={S.card}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                  <div style={{ fontWeight: 900 }}>Order #{o.id.slice(0, 8)}</div>
                  <Badge tone={o.status === "paid" ? "ok" : "warn"}>{o.status}</Badge>
                </div>

                <div style={{ marginTop: 8, opacity: 0.85, display: "flex", gap: 12, flexWrap: "wrap" }}>
                  <span style={S.kv}><b>Pi:</b> {o.amount_pi ?? o.price_pi ?? 0}</span>
                  <span style={S.kv}><b>Buyer:</b> {o.buyer_id?.slice?.(0, 8)}</span>
                  <span style={S.kv}><b>RFQ:</b> {o.rfq_id?.slice?.(0, 8)}</span>
                </div>

                <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <button onClick={() => nav(`/orders/${o.id}`)} style={S.btn2}>View Detail</button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function Tab({ active, children, onClick }) {
  return (
    <button onClick={onClick} style={{
      padding: "9px 12px",
      borderRadius: 12,
      border: "1px solid rgba(255,255,255,.14)",
      background: active ? "rgba(120,70,255,.30)" : "rgba(255,255,255,.06)",
      color: "white",
      cursor: "pointer",
      fontWeight: 800
    }}>
      {children}
    </button>
  );
}

const S = {
  page: { padding: 16, maxWidth: 980, margin: "0 auto" },
  top: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" },
  h1: { fontSize: 22, fontWeight: 900 },
  sub: { opacity: 0.8, marginTop: 6 },
  tabs: { display: "flex", gap: 10, flexWrap: "wrap", marginTop: 14 },
  btn: { padding: "10px 14px", borderRadius: 12, border: "1px solid rgba(255,255,255,.14)", background: "rgba(255,255,255,.06)", color: "white", cursor: "pointer", fontWeight: 800 },
  btn2: { padding: "10px 14px", borderRadius: 12, border: "1px solid rgba(160,120,255,.55)", background: "rgba(120,70,255,.35)", color: "white", cursor: "pointer", fontWeight: 900 },
  card: { padding: 14, borderRadius: 16, border: "1px solid rgba(255,255,255,.12)", background: "rgba(0,0,0,.22)" },
  err: { marginTop: 12, padding: 12, borderRadius: 14, border: "1px solid rgba(255,0,80,.25)", background: "rgba(255,0,80,.08)" },
  empty: { padding: 14, borderRadius: 16, border: "1px solid rgba(255,255,255,.12)", background: "rgba(255,255,255,.04)", opacity: 0.85 },
  kv: { background: "rgba(255,255,255,.05)", padding: "6px 10px", borderRadius: 999, border: "1px solid rgba(255,255,255,.10)" },
};
