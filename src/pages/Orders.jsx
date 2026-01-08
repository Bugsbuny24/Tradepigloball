import React from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { getAuthDebug } from "../lib/debugAuth";

export default function Orders() {
  const nav = useNavigate();

  const [authDbg, setAuthDbg] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [err, setErr] = React.useState("");
  const [items, setItems] = React.useState([]);

  async function load() {
    setLoading(true);
    setErr("");

    const dbg = await getAuthDebug();
    setAuthDbg(dbg);

    if (!dbg?.userId) {
      setItems([]);
      setErr("Önce login ol kanka.");
      setLoading(false);
      return;
    }

    // Orders: buyer veya seller olarak benim olanlar
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .or(`buyer_id.eq.${dbg.userId},seller_id.eq.${dbg.userId}`)
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) {
      setErr(error.message || "Orders load failed");
      setItems([]);
    } else {
      setItems(data || []);
    }

    setLoading(false);
  }

  React.useEffect(() => {
    load();

    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      load();
    });

    return () => sub?.subscription?.unsubscribe?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{ padding: 16, maxWidth: 980, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <h2 style={{ margin: 0 }}>Orders</h2>
        <button style={btn2} onClick={load}>Refresh</button>
      </div>

      <div style={dbgBox}>
        <b>Auth Debug</b>
        <div>userId: {authDbg?.userId ?? "-"}</div>
        <div>email: {authDbg?.email ?? "-"}</div>
      </div>

      {err ? <div style={errBox}><b>Hata:</b> {err}</div> : null}

      {loading ? (
        <div style={card}>Loading...</div>
      ) : items.length === 0 ? (
        <div style={card}>No orders yet.</div>
      ) : (
        <div style={{ display: "grid", gap: 10, marginTop: 10 }}>
          {items.map((o) => (
            <div
              key={o.id}
              style={{ ...card, cursor: "pointer" }}
              onClick={() => nav(`/orders/${o.id}`)}
              title="Open order detail"
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                <div style={{ fontWeight: 900 }}>Order</div>
                <Badge status={o.status} />
              </div>

              <div style={{ marginTop: 8, fontSize: 12, opacity: 0.75 }}>
                <div>id: {o.id}</div>
                <div>buyer_id: {o.buyer_id}</div>
                <div>seller_id: {o.seller_id}</div>
                {o.rfq_id ? <div>rfq_id: {o.rfq_id}</div> : null}
                {o.offer_id ? <div>offer_id: {o.offer_id}</div> : null}
              </div>

              <div style={{ marginTop: 8, fontSize: 12, opacity: 0.7 }}>
                Created: {o.created_at ? new Date(o.created_at).toLocaleString() : "-"}
              </div>

              <div style={{ marginTop: 8, fontSize: 12, opacity: 0.85 }}>
                Open detail →
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Badge({ status }) {
  const s = String(status || "");
  return (
    <span style={badge}>
      {s || "—"}
    </span>
  );
}

const card = {
  padding: 12,
  borderRadius: 12,
  background: "rgba(0,0,0,.18)",
  border: "1px solid rgba(255,255,255,.06)",
  color: "white",
};

const btn2 = {
  padding: "10px 12px",
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,.12)",
  background: "rgba(0,0,0,.22)",
  color: "white",
  cursor: "pointer",
  fontWeight: 800,
};

const badge = {
  padding: "6px 10px",
  borderRadius: 999,
  border: "1px solid rgba(255,255,255,.14)",
  background: "rgba(0,0,0,.25)",
  fontSize: 12,
  fontWeight: 800,
};

const dbgBox = {
  marginTop: 12,
  padding: 10,
  border: "1px dashed #555",
  borderRadius: 12,
  color: "white",
  opacity: 0.95,
};

const errBox = {
  marginTop: 12,
  padding: 12,
  borderRadius: 12,
  border: "1px solid rgba(255,0,0,.25)",
  background: "rgba(255,0,0,.06)",
  whiteSpace: "pre-wrap",
  color: "white",
};
