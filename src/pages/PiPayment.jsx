import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { getAuthDebug } from "../lib/debugAuth";

export default function PiPayment() {
  const { orderId } = useParams();
  const nav = useNavigate();

  const [authDbg, setAuthDbg] = React.useState(null);
  const [order, setOrder] = React.useState(null);
  const [payment, setPayment] = React.useState(null);
  const [txid, setTxid] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  async function load() {
    const dbg = await getAuthDebug();
    setAuthDbg(dbg);

    const o = await supabase.from("orders").select("*").eq("id", orderId).maybeSingle();
    if (!o.error) setOrder(o.data);

    const p = await supabase
      .from("pi_payments")
      .select("*")
      .eq("order_id", orderId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!p.error) setPayment(p.data);
  }

  React.useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  async function onCreatePayment() {
    const dbg = await getAuthDebug();
    setAuthDbg(dbg);
    if (!dbg?.userId) return alert("Önce login ol kanka.");

    setLoading(true);
    try {
      const { data: paymentId, error } = await supabase.rpc("rpc_pi_payment_create", {
        p_order_id: orderId,
        p_memo: "TradePiGloball order payment",
      });
      if (error) throw error;

      await load();
      alert("Payment created ✅ " + paymentId);
    } catch (e) {
      alert(e?.message || "Hata");
    } finally {
      setLoading(false);
    }
  }

  async function onMarkPaid() {
    if (!payment?.id) return alert("Önce payment create et kanka.");
    if (!txid) return alert("txid gir kanka (test için).");

    setLoading(true);
    try {
      const { error } = await supabase.rpc("rpc_pi_payment_mark_paid", {
        p_payment_id: payment.id,
        p_txid: txid,
      });
      if (error) throw error;

      await load();
      alert("Marked as paid ✅");
    } catch (e) {
      alert(e?.message || "Hata");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: 16 }}>
      <button onClick={() => nav(-1)} style={btn2}>← Back</button>

      <h2 style={{ marginTop: 12 }}>Pi Payment</h2>

      <div style={dbgBox}>
        <b>Auth Debug</b>
        <div>userId: {authDbg?.userId ?? "-"}</div>
        <div>email: {authDbg?.email ?? "-"}</div>
      </div>

      {order ? (
        <div style={card}>
          <div><b>Order:</b> {order.id}</div>
          <div><b>Amount PI:</b> {order.amount_pi}</div>
          <div style={{ opacity: 0.8 }}>order status: {order.status}</div>
        </div>
      ) : (
        <div style={{ opacity: 0.8 }}>Loading order...</div>
      )}

      <div style={card}>
        <div><b>Payment:</b> {payment?.id ?? "-"}</div>
        <div><b>Status:</b> {payment?.status ?? "-"}</div>
        <div><b>Amount PI:</b> {payment?.amount_pi ?? "-"}</div>
        <div style={{ opacity: 0.8 }}><b>txid:</b> {payment?.txid ?? "-"}</div>

        <button onClick={onCreatePayment} disabled={loading} style={{ ...btn, marginTop: 10 }}>
          {loading ? "Working..." : "Create Payment Request"}
        </button>

        <div style={{ marginTop: 10 }}>
          <input value={txid} onChange={(e) => setTxid(e.target.value)} placeholder="txid (test)" style={inp} />
          <button onClick={onMarkPaid} disabled={loading} style={{ ...btn, marginTop: 10 }}>
            {loading ? "Working..." : "Mark Paid (test)"}
          </button>
        </div>

        <div style={{ opacity: 0.7, marginTop: 8 }}>
          Not: Şimdilik test/placeholder. Gerçek Pi ödeme entegrasyonu gelince bu ekran gerçek akışa bağlanacak.
        </div>
      </div>
    </div>
  );
}

const inp = {
  padding: 12,
  borderRadius: 12,
  background: "rgba(0,0,0,.18)",
  color: "white",
  border: "1px solid rgba(255,255,255,.12)",
  width: "100%",
  boxSizing: "border-box",
};
const btn = { padding: 12, borderRadius: 14, background: "#6d5cff", color: "white", border: "none", fontWeight: 800, width: "100%" };
const btn2 = { padding: 10, borderRadius: 12, background: "rgba(255,255,255,.08)", color: "white", border: "1px solid rgba(255,255,255,.12)" };
const card = { padding: 12, marginTop: 10, borderRadius: 12, background: "rgba(0,0,0,.18)" };
const dbgBox = { margin: "12px 0", padding: 10, border: "1px dashed #555", borderRadius: 12 };
