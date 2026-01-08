import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { getAuthDebug } from "../lib/debugAuth";

export default function OrderDetail() {
  const { id } = useParams();
  const nav = useNavigate();

  const [authDbg, setAuthDbg] = React.useState(null);
  const [meId, setMeId] = React.useState(null);

  const [order, setOrder] = React.useState(null);
  const [rfq, setRfq] = React.useState(null);
  const [offer, setOffer] = React.useState(null);

  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [err, setErr] = React.useState("");

  async function loadAuth() {
    const dbg = await getAuthDebug();
    setAuthDbg(dbg);
    setMeId(dbg?.userId || null);
    return dbg?.userId || null;
  }

  async function loadOrder() {
    setErr("");
    const { data, error } = await supabase.from("orders").select("*").eq("id", id).single();
    if (error) {
      setOrder(null);
      setErr(error.message || "Order load failed");
      return null;
    }
    setOrder(data);
    return data;
  }

  async function loadRelated(o) {
    // RFQ + Offer (optional)
    setRfq(null);
    setOffer(null);

    if (o?.rfq_id) {
      const { data } = await supabase.from("rfqs").select("*").eq("id", o.rfq_id).single();
      setRfq(data || null);
    }
    if (o?.offer_id) {
      const { data } = await supabase.from("rfq_offers").select("*").eq("id", o.offer_id).single();
      setOffer(data || null);
    }
  }

  async function loadAll() {
    setLoading(true);
    try {
      const uid = await loadAuth();
      if (!uid) {
        setErr("Önce login ol kanka.");
        return;
      }
      const o = await loadOrder();
      if (o) await loadRelated(o);
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    loadAll();

    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      loadAll();
    });

    return () => sub?.subscription?.unsubscribe?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const isBuyer = meId && order?.buyer_id === meId;
  const isSeller = meId && order?.seller_id === meId;

  async function setStatus(next) {
    if (!order?.id) return;
    setSaving(true);
    setErr("");
    try {
      // Basit: direct update (RLS izin vermezse aşağıdaki SQL RPC’ye geçeceğiz)
      const { error } = await supabase
        .from("orders")
        .update({ status: next })
        .eq("id", order.id);

      if (error) throw error;

      await loadAll();
    } catch (e) {
      setErr(e?.message || "Status update failed (RLS?)");
      alert(e?.message || "Status update failed");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div style={{ padding: 16 }}>
        <div style={card}>Loading...</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div style={{ padding: 16 }}>
        <div style={card}>
          <h2>Order Detail</h2>
          <div style={{ opacity: 0.9 }}>Order not found.</div>
          {err ? <div style={{ marginTop: 10, color: "#ffb4b4" }}>{err}</div> : null}
          <button style={btn2} onClick={() => nav("/orders")}>Back</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: 16, maxWidth: 980, margin: "0 auto" }}>
      <button style={btn2} onClick={() => nav("/orders")}>← Orders</button>

      <h2 style={{ marginTop: 12 }}>Order Detail</h2>

      <div style={dbgBox}>
        <b>Auth Debug</b>
        <div>userId: {authDbg?.userId ?? "-"}</div>
        <div>email: {authDbg?.email ?? "-"}</div>
        <div>you: {isBuyer ? "buyer" : isSeller ? "seller" : "viewer?"}</div>
      </div>

      {err ? <div style={errBox}><b>Hata:</b> {err}</div> : null}

      <div style={card}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
          <div style={{ fontWeight: 900, fontSize: 18 }}>Order</div>
          <span style={badge}>{order.status || "—"}</span>
        </div>

        <div style={{ marginTop: 10, fontSize: 12, opacity: 0.8 }}>
          <div>order_id: {order.id}</div>
          <div>buyer_id: {order.buyer_id}</div>
          <div>seller_id: {order.seller_id}</div>
          {order.rfq_id ? <div>rfq_id: {order.rfq_id}</div> : null}
          {order.offer_id ? <div>offer_id: {order.offer_id}</div> : null}
          <div>created_at: {order.created_at ? new Date(order.created_at).toLocaleString() : "-"}</div>
        </div>

        <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button style={btn2} onClick={loadAll} disabled={saving}>
            Refresh
          </button>

          {/* Buyer actions */}
          {isBuyer ? (
            <>
              <button
                style={btn1}
                onClick={() => setStatus("paid")}
                disabled={saving || order.status === "paid" || order.status === "shipping" || order.status === "delivered"}
              >
                {saving ? "..." : "Mark Paid"}
              </button>

              <button
                style={btn1}
                onClick={() => setStatus("delivered")}
                disabled={saving || order.status !== "shipping"}
              >
                {saving ? "..." : "Confirm Delivered"}
              </button>
            </>
          ) : null}

          {/* Seller actions */}
          {isSeller ? (
            <>
              <button
                style={btn1}
                onClick={() => setStatus("shipping")}
                disabled={saving || order.status !== "paid"}
              >
                {saving ? "..." : "Mark Shipped"}
              </button>

              <button
                style={btn1}
                onClick={() => setStatus("completed")}
                disabled={saving || order.status !== "delivered"}
              >
                {saving ? "..." : "Complete"}
              </button>
            </>
          ) : null}
        </div>

        <div style={{ marginTop: 10, fontSize: 12, opacity: 0.75 }}>
          Not: Bu “manual status” akışı. Pi ödeme entegrasyonunu sonra `pi_payments` ile bağlarız.
        </div>
      </div>

      {rfq ? (
        <div style={card}>
          <div style={{ fontWeight: 900 }}>RFQ</div>
          <div style={{ marginTop: 6, opacity: 0.9 }}>
            <div><b>{rfq.title}</b></div>
            {rfq.description ? <div style={{ whiteSpace: "pre-wrap" }}>{rfq.description}</div> : null}
            <div style={{ marginTop: 8, fontSize: 12, opacity: 0.75 }}>status: {rfq.status}</div>
          </div>
        </div>
      ) : null}

      {offer ? (
        <div style={card}>
          <div style={{ fontWeight: 900 }}>Accepted Offer</div>
          <div style={{ marginTop: 6, opacity: 0.9 }}>
            <div>price_pi: <b>{offer.price_pi ?? "—"}</b></div>
            {offer.message ? <div style={{ whiteSpace: "pre-wrap", marginTop: 6 }}>{offer.message}</div> : null}
            <div style={{ marginTop: 8, fontSize: 12, opacity: 0.75 }}>status: {offer.status}</div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

const card = {
  padding: 12,
  marginTop: 10,
  borderRadius: 12,
  background: "rgba(0,0,0,.18)",
  border: "1px solid rgba(255,255,255,.06)",
  color: "white",
};

const btn1 = {
  padding: 12,
  borderRadius: 14,
  background: "#6d5cff",
  color: "white",
  border: "none",
  cursor: "pointer",
  fontWeight: 900,
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
  fontWeight: 900,
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
