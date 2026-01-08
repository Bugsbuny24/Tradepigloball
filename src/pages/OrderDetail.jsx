import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { getAuthDebug } from "../lib/debugAuth";

const STATUS = {
  PENDING: "pending_payment",
  PAID: "paid",
  SHIPPED: "shipped",
  DELIVERED: "delivered",
  COMPLETED: "completed",
  CANCELED: "canceled",
};

export default function OrderDetail() {
  const { id } = useParams();
  const nav = useNavigate();

  const [authDbg, setAuthDbg] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [err, setErr] = React.useState("");
  const [order, setOrder] = React.useState(null);

  const [busy, setBusy] = React.useState(false);

  async function load() {
    setLoading(true);
    setErr("");
    try {
      const dbg = await getAuthDebug();
      setAuthDbg(dbg);

      const { data, error } = await supabase.from("orders").select("*").eq("id", id).maybeSingle();
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
  }, [id]);

  const me = authDbg?.userId || null;
  const isBuyer = !!order && me && order.buyer_id === me;
  const isSeller = !!order && me && order.seller_id === me;

  async function setStatus(next) {
    setBusy(true);
    setErr("");
    try {
      const { error } = await supabase
        .from("orders")
        .update({ status: next, updated_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
      await load();
    } catch (e) {
      setErr(e?.message || "Update error (RLS?)");
    } finally {
      setBusy(false);
    }
  }

  async function markPaidAfterPi(txid) {
    // Pi Payment sayfası burayı çağırmayacak (oradan direkt update yapacağız),
    // ama burada da opsiyon bırakıyorum.
    return setStatus(STATUS.PAID);
  }

  if (loading) return <div style={page}><div style={card}>Loading…</div></div>;
  if (err) return <div style={page}><div style={card}><b>Hata:</b> {err}</div></div>;
  if (!order) return <div style={page}><div style={card}>Order not found.</div></div>;

  return (
    <div style={page}>
      <div style={card}>
        <h2 style={{ margin: 0 }}>Order Detail</h2>

        <div style={{ marginTop: 10, opacity: 0.9 }}>
          <div><b>Order:</b> {order.id}</div>
          <div><b>Status:</b> <span style={badge(order.status)}>{order.status}</span></div>
          <div><b>RFQ:</b> {order.rfq_id}</div>
          <div><b>Offer:</b> {order.offer_id}</div>
          <div><b>Buyer:</b> {order.buyer_id}</div>
          <div><b>Seller:</b> {order.seller_id}</div>
          <div><b>Amount (Pi):</b> {order.amount_pi}</div>
          {order.price_pi != null ? <div><b>Price Pi:</b> {order.price_pi}</div> : null}
        </div>

        <div style={dbgBox}>
          <b>Auth Debug</b>
          <div>userId: {authDbg?.userId ?? "-"}</div>
          <div>email: {authDbg?.email ?? "-"}</div>
          <div>role: {isBuyer ? "buyer" : isSeller ? "seller" : "viewer"}</div>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 12 }}>
          <button style={btn2} onClick={() => nav("/orders")}>Back</button>

          {order.status === STATUS.PENDING && isBuyer ? (
            <button style={btn} onClick={() => nav(`/pi/payment/${order.id}`)}>
              Pay with Pi
            </button>
          ) : null}

          {/* Seller actions */}
          {isSeller && order.status === STATUS.PAID ? (
            <button style={btn2} disabled={busy} onClick={() => setStatus(STATUS.SHIPPED)}>
              Mark Shipped
            </button>
          ) : null}

          {/* Buyer actions */}
          {isBuyer && order.status === STATUS.SHIPPED ? (
            <button style={btn2} disabled={busy} onClick={() => setStatus(STATUS.DELIVERED)}>
              Confirm Delivery
            </button>
          ) : null}

          {/* Complete */}
          {(isBuyer || isSeller) && order.status === STATUS.DELIVERED ? (
            <button style={btn2} disabled={busy} onClick={() => setStatus(STATUS.COMPLETED)}>
              Complete
            </button>
          ) : null}

          {/* Cancel */}
          {(isBuyer || isSeller) && order.status === STATUS.PENDING ? (
            <button style={dangerBtn} disabled={busy} onClick={() => setStatus(STATUS.CANCELED)}>
              Cancel
            </button>
          ) : null}
        </div>

        <div style={{ marginTop: 14, opacity: 0.75 }}>
          Not: Status update RLS yüzünden “permission denied” verirse aşağıdaki SQL policy’yi ekle (en altta verdim).
        </div>
      </div>
    </div>
  );
}

const page = { padding: 16, maxWidth: 980, margin: "0 auto" };
const card = { padding: 16, borderRadius: 16, border: "1px solid rgba(255,255,255,.12)", background: "rgba(0,0,0,.22)" };
const dbgBox = { marginTop: 12, padding: 10, border: "1px dashed #555", borderRadius: 12 };
const btn = { padding: 12, borderRadius: 14, background: "#6d5cff", color: "white", border: "none", fontWeight: 900, cursor: "pointer" };
const btn2 = { padding: 12, borderRadius: 14, background: "rgba(255,255,255,.06)", color: "white", border: "1px solid rgba(255,255,255,.14)", fontWeight: 800, cursor: "pointer" };
const dangerBtn = { ...btn2, border: "1px solid rgba(255,80,80,.25)", background: "rgba(255,80,80,.10)" };

function badge(s) {
  return {
    padding: "4px 10px",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,.18)",
    background: "rgba(255,255,255,.06)",
    fontSize: 12,
    fontWeight: 900,
  };
          }
