import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { getAuthDebug } from "../lib/debugAuth";

export default function OrderDetail() {
  const { id } = useParams();
  const nav = useNavigate();

  const [authDbg, setAuthDbg] = React.useState(null);
  const [order, setOrder] = React.useState(null);
  const [loading, setLoading] = React.useState(false);

  async function load() {
    setLoading(true);
    try {
      const dbg = await getAuthDebug();
      setAuthDbg(dbg);

      const { data, error } = await supabase.from("orders").select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      setOrder(data);
    } catch (e) {
      alert(e?.message || "Hata");
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  return (
    <div style={{ padding: 16 }}>
      <button onClick={() => nav(-1)} style={btn2}>← Back</button>

      <h2 style={{ marginTop: 12 }}>Order Detail</h2>

      <div style={dbgBox}>
        <b>Auth Debug</b>
        <div>userId: {authDbg?.userId ?? "-"}</div>
        <div>email: {authDbg?.email ?? "-"}</div>
      </div>

      {loading ? (
        <div style={{ opacity: 0.8 }}>Loading...</div>
      ) : order ? (
        <div style={card}>
          <div><b>Order ID:</b> {order.id}</div>
          <div><b>RFQ:</b> {order.rfq_id}</div>
          <div><b>Offer:</b> {order.offer_id}</div>
          <div><b>Amount PI:</b> {order.amount_pi}</div>
          <div style={{ opacity: 0.8, marginTop: 6 }}>status: {order.status}</div>

          <button
            onClick={() => nav(`/pi/payment/${order.id}`)}
            style={{ ...btn, marginTop: 12 }}
          >
            Pay with Pi →
          </button>
        </div>
      ) : (
        <div style={{ opacity: 0.8 }}>Order not found.</div>
      )}
    </div>
  );
}

const btn = { padding: 12, borderRadius: 14, background: "#6d5cff", color: "white", border: "none", fontWeight: 800, width: "100%" };
const btn2 = { padding: 10, borderRadius: 12, background: "rgba(255,255,255,.08)", color: "white", border: "1px solid rgba(255,255,255,.12)" };
const card = { padding: 12, marginTop: 10, borderRadius: 12, background: "rgba(0,0,0,.18)" };
const dbgBox = { margin: "12px 0", padding: 10, border: "1px dashed #555", borderRadius: 12 };
