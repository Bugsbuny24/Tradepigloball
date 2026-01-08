import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import supabase from "../lib/supabaseClient";

function fmt(v) {
  if (v === null || v === undefined) return "-";
  if (typeof v === "object") return JSON.stringify(v);
  return String(v);
}
function money(n) {
  const x = Number(n);
  if (Number.isNaN(x)) return fmt(n);
  return x.toFixed(4).replace(/\.?0+$/, "");
}
function Badge({ children, tone = "neutral" }) {
  const bg =
    tone === "ok"
      ? "rgba(0,255,160,.10)"
      : tone === "warn"
      ? "rgba(255,210,0,.12)"
      : tone === "bad"
      ? "rgba(255,0,80,.10)"
      : "rgba(255,255,255,.08)";
  const bd =
    tone === "ok"
      ? "1px solid rgba(0,255,160,.25)"
      : tone === "warn"
      ? "1px solid rgba(255,210,0,.28)"
      : tone === "bad"
      ? "1px solid rgba(255,0,80,.25)"
      : "1px solid rgba(255,255,255,.14)";
  return (
    <span style={{ padding: "6px 10px", borderRadius: 999, background: bg, border: bd, fontSize: 12, fontWeight: 700 }}>
      {children}
    </span>
  );
}

export default function OrderDetail() {
  const { orderId } = useParams();
  const nav = useNavigate();

  const [me, setMe] = React.useState(null);
  const [order, setOrder] = React.useState(null);
  const [rfq, setRfq] = React.useState(null);
  const [offer, setOffer] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [err, setErr] = React.useState("");

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

    const { data: o, error: oe } = await supabase.from("orders").select("*").eq("id", orderId).single();
    if (oe) {
      setErr(oe.message);
      setLoading(false);
      return;
    }
    setOrder(o);

    // RFQ + Offer (opsiyonel ama premium)
    const [r1, r2] = await Promise.all([
      supabase.from("rfqs").select("*").eq("id", o.rfq_id).single(),
      supabase.from("rfq_offers").select("*").eq("id", o.offer_id).single(),
    ]);

    if (!r1.error) setRfq(r1.data);
    if (!r2.error) setOffer(r2.data);

    setLoading(false);
  }

  React.useEffect(() => {
    load();
  }, [orderId]);

  const statusTone =
    order?.status === "paid" ? "ok" : order?.status === "pending_payment" ? "warn" : order?.status ? "neutral" : "neutral";

  const canPay = order?.status === "pending_payment" && me && order?.buyer_id === me.id;

  return (
    <div style={S.page}>
      <div style={S.topRow}>
        <button onClick={() => nav(-1)} style={S.backBtn}>← Back</button>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          {order?.status ? <Badge tone={statusTone}>{order.status}</Badge> : null}
          <button onClick={load} style={S.ghostBtn}>Refresh</button>
        </div>
      </div>

      <div style={S.hero}>
        <div>
          <div style={S.kicker}>Order Detail</div>
          <div style={S.h1}>Order #{orderId?.slice?.(0, 8) || ""}</div>
          <div style={S.sub}>
            Buyer → Seller direct payment via Pi Network. Platform is showroom & workflow only.
          </div>
        </div>

        <div style={S.amountCard}>
          <div style={{ opacity: 0.75, fontSize: 12 }}>Amount (Pi)</div>
          <div style={{ fontSize: 28, fontWeight: 900 }}>{money(order?.amount_pi ?? order?.price_pi ?? 0)} Pi</div>
          {canPay ? (
            <button onClick={() => nav(`/pi/payment/${order.id}`)} style={S.primaryBtn}>
              Pay with Pi
            </button>
          ) : (
            <button disabled style={S.disabledBtn}>
              {order?.status === "paid" ? "Paid ✅" : "Pay (Buyer only)"}
            </button>
          )}
          <div style={{ marginTop: 10, opacity: 0.7, fontSize: 12 }}>
            Payment is executed in Pi Browser using Pi SDK.
          </div>
        </div>
      </div>

      {err ? <div style={S.err}><b>Hata:</b> {err}</div> : null}
      {loading ? <div style={{ marginTop: 12 }}>Loading...</div> : null}

      {!loading && order ? (
        <div style={S.grid}>
          <div style={S.card}>
            <div style={S.cardTitle}>Order</div>
            <Line label="id" value={order.id} mono />
            <Line label="status" value={order.status} />
            <Line label="rfq_id" value={order.rfq_id} mono />
            <Line label="offer_id" value={order.offer_id} mono />
            <Line label="buyer_id" value={order.buyer_id} mono />
            <Line label="seller_id" value={order.seller_id} mono />
            <Line label="created_at" value={order.created_at} />
          </div>

          <div style={S.card}>
            <div style={S.cardTitle}>RFQ</div>
            {rfq ? (
              <>
                <Line label="title" value={rfq.title} />
                <Line label="country" value={rfq.country} />
                <Line label="budget_pi" value={rfq.budget_pi} />
                <Line label="status" value={rfq.status} />
              </>
            ) : (
              <div style={{ opacity: 0.75 }}>RFQ not loaded.</div>
            )}
          </div>

          <div style={S.card}>
            <div style={S.cardTitle}>Offer</div>
            {offer ? (
              <>
                <Line label="price_pi" value={offer.price_pi} />
                <Line label="status" value={offer.status} />
                <div style={{ marginTop: 10, opacity: 0.75, fontSize: 12 }}>message</div>
                <div style={S.noteBox}>{offer.message || "-"}</div>
              </>
            ) : (
              <div style={{ opacity: 0.75 }}>Offer not loaded.</div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Line({ label, value, mono }) {
  return (
    <div style={{ display: "flex", gap: 10, marginTop: 8, alignItems: "center" }}>
      <div style={{ width: 110, opacity: 0.65, fontSize: 12 }}>{label}</div>
      <div style={{ fontFamily: mono ? "monospace" : "inherit", overflow: "hidden", textOverflow: "ellipsis" }}>
        {fmt(value)}
      </div>
    </div>
  );
}

const S = {
  page: { padding: 16, maxWidth: 1080, margin: "0 auto" },
  topRow: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" },
  backBtn: { padding: "10px 12px", borderRadius: 12, border: "1px solid rgba(255,255,255,.14)", background: "rgba(0,0,0,.22)", color: "white", cursor: "pointer" },
  ghostBtn: { padding: "10px 12px", borderRadius: 12, border: "1px solid rgba(255,255,255,.14)", background: "rgba(255,255,255,.06)", color: "white", cursor: "pointer" },

  hero: {
    marginTop: 14,
    padding: 16,
    borderRadius: 18,
    border: "1px solid rgba(255,255,255,.12)",
    background: "linear-gradient(135deg, rgba(120,70,255,.18), rgba(0,0,0,.18))",
    display: "grid",
    gridTemplateColumns: "1.2fr .8fr",
    gap: 12,
  },
  kicker: { opacity: 0.75, fontSize: 12, marginBottom: 6 },
  h1: { fontSize: 24, fontWeight: 900 },
  sub: { marginTop: 8, opacity: 0.8, maxWidth: 650 },

  amountCard: { padding: 14, borderRadius: 16, border: "1px solid rgba(255,255,255,.12)", background: "rgba(0,0,0,.22)" },
  primaryBtn: { marginTop: 10, padding: "10px 14px", borderRadius: 14, border: "1px solid rgba(160,120,255,.55)", background: "rgba(120,70,255,.40)", color: "white", cursor: "pointer", fontWeight: 900 },
  disabledBtn: { marginTop: 10, padding: "10px 14px", borderRadius: 14, border: "1px solid rgba(255,255,255,.12)", background: "rgba(255,255,255,.05)", color: "rgba(255,255,255,.5)" },

  err: { marginTop: 12, padding: 12, borderRadius: 14, border: "1px solid rgba(255,0,80,.25)", background: "rgba(255,0,80,.08)" },

  grid: { marginTop: 12, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 12 },
  card: { padding: 14, borderRadius: 16, border: "1px solid rgba(255,255,255,.12)", background: "rgba(0,0,0,.22)" },
  cardTitle: { fontWeight: 900, marginBottom: 6 },
  noteBox: { marginTop: 8, padding: 10, borderRadius: 12, border: "1px solid rgba(255,255,255,.10)", background: "rgba(255,255,255,.04)", whiteSpace: "pre-wrap" },
};
