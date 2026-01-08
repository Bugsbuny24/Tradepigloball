import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { getAuthDebug } from "../lib/debugAuth";

export default function PiPayment() {
  const { orderId } = useParams();
  const nav = useNavigate();

  const [authDbg, setAuthDbg] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [err, setErr] = React.useState("");
  const [ok, setOk] = React.useState("");

  const [order, setOrder] = React.useState(null);
  const [txid, setTxid] = React.useState("");

  const [busy, setBusy] = React.useState(false);

  async function load() {
    setLoading(true);
    setErr("");
    setOk("");
    try {
      const dbg = await getAuthDebug();
      setAuthDbg(dbg);

      const { data, error } = await supabase.from("orders").select("*").eq("id", orderId).maybeSingle();
      if (error) throw error;
      setOrder(data || null);
    } catch (e) {
      setErr(e?.message || "Load error");
      setOrder(null);
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    load();
    const { data: sub } = supabase.auth.onAuthStateChange(() => load());
    return () => sub?.subscription?.unsubscribe?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  async function confirmPaid() {
    setBusy(true);
    setErr("");
    setOk("");
    try {
      if (!authDbg?.userId) throw new Error("Not authenticated");
      if (!order) throw new Error("Order not found");
      if (!txid.trim()) throw new Error("txid required");

      // 1) pi_payments insert
      const { error: pe } = await supabase.from("pi_payments").insert({
        user_id: authDbg.userId,
        order_id: order.id,
        amount_pi: order.amount_pi ?? order.price_pi ?? 0,
        memo: "order payment",
        txid: txid.trim(),
        status: "completed",
      });
      if (pe) throw pe;

      // 2) order status -> paid
      const { error: oe } = await supabase
        .from("orders")
        .update({ status: "paid", updated_at: new Date().toISOString() })
        .eq("id", order.id);
      if (oe) throw oe;

      setOk("Payment saved ✅ Order marked as PAID ✅");
      setTimeout(() => nav(`/orders/${order.id}`), 600);
    } catch (e) {
      setErr(e?.message || "Payment error (RLS?)");
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <div style={page}><div style={card}>Loading…</div></div>;
  if (err && !order) return <div style={page}><div style={card}><b>Hata:</b> {err}</div></div>;
  if (!order) return <div style={page}><div style={card}>Order not found.</div></div>;

  return (
    <div style={page}>
      <div style={card}>
        <h2 style={{ margin: 0 }}>Pi Payment</h2>

        <div style={{ marginTop: 10, opacity: 0.9 }}>
          <div><b>Order:</b> {order.id}</div>
          <div><b>Status:</b> {order.status}</div>
          <div><b>Amount Pi:</b> {order.amount_pi}</div>
        </div>

        <div style={dbgBox}>
          <b>Auth Debug</b>
          <div>userId: {authDbg?.userId ?? "-"}</div>
          <div>email: {authDbg?.email ?? "-"}</div>
        </div>

        {err ? <div style={errBox}><b>Hata:</b> {err}</div> : null}
        {ok ? <div style={okBox}>{ok}</div> : null}

        <div style={{ marginTop: 12, display: "grid", gap: 10, maxWidth: 520 }}>
          <input
            value={txid}
            onChange={(e) => setTxid(e.target.value)}
            placeholder="Pi txid (manual for now)"
            style={inp}
          />
          <button onClick={confirmPaid} disabled={busy} style={btn}>
            {busy ? "Working..." : "Confirm Paid"}
          </button>

          <button style={btn2} onClick={() => nav(`/orders/${order.id}`)}>Back to Order</button>

          <div style={{ opacity: 0.7 }}>
            Şimdilik txid manuel. Pi SDK entegre olunca bu ekranda “Pay” butonu txid’yi otomatik dolduracak.
          </div>
        </div>
      </div>
    </div>
  );
}

const page = { padding: 16, maxWidth: 980, margin: "0 auto" };
const card = { padding: 16, borderRadius: 16, border: "1px solid rgba(255,255,255,.12)", background: "rgba(0,0,0,.22)" };
const dbgBox = { marginTop: 12, padding: 10, border: "1px dashed #555", borderRadius: 12 };
const inp = { padding: 12, borderRadius: 12, background: "rgba(0,0,0,.18)", color: "white", border: "1px solid rgba(255,255,255,.12)" };
const btn = { padding: 12, borderRadius: 14, background: "#6d5cff", color: "white", border: "none", fontWeight: 900, cursor: "pointer" };
const btn2 = { padding: 12, borderRadius: 14, background: "rgba(255,255,255,.06)", color: "white", border: "1px solid rgba(255,255,255,.14)", fontWeight: 800, cursor: "pointer" };
const errBox = { marginTop: 12, padding: 12, borderRadius: 12, border: "1px solid rgba(255,0,0,.25)", background: "rgba(255,0,0,.06)" };
const okBox = { marginTop: 12, padding: 12, borderRadius: 12, border: "1px solid rgba(0,255,0,.18)", background: "rgba(0,255,0,.06)" };
