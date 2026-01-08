import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import supabase from "../lib/supabaseClient";

function money(n) {
  if (n === null || n === undefined) return "-";
  const x = Number(n);
  if (Number.isNaN(x)) return String(n);
  return x.toFixed(4).replace(/\.?0+$/, "");
}

export default function PiPayment() {
  const { orderId } = useParams(); // route: /pi/payment/:orderId
  const nav = useNavigate();

  const [me, setMe] = useState(null);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [msg, setMsg] = useState("");
  const [piReady, setPiReady] = useState(false);

  const isPiBrowser = useMemo(() => typeof window !== "undefined" && !!window.Pi, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setMsg("");

      const { data: auth } = await supabase.auth.getUser();
      if (!auth?.user) {
        setLoading(false);
        setMsg("Login gerekli.");
        return;
      }
      setMe(auth.user);

      const { data: o, error } = await supabase
        .from("orders")
        .select("*")
        .eq("id", orderId)
        .single();

      if (error) {
        setLoading(false);
        setMsg(error.message);
        return;
      }

      setOrder(o);
      setLoading(false);

      // Pi init
      if (typeof window !== "undefined" && window.Pi) {
        try {
          // Sandbox = false => GERÇEK ödeme
          window.Pi.init({ version: "2.0", sandbox: false });
          setPiReady(true);
        } catch (e) {
          console.error(e);
          setPiReady(false);
        }
      } else {
        setPiReady(false);
      }
    })();
  }, [orderId]);

  async function refreshOrder() {
    const { data: o } = await supabase.from("orders").select("*").eq("id", orderId).single();
    if (o) setOrder(o);
  }

  async function startPiPayment() {
    setMsg("");
    if (!me) return setMsg("Login gerekli.");
    if (!order) return setMsg("Order bulunamadı.");
    if (!isPiBrowser) return setMsg("Pi ödeme sadece Pi Browser içinde açılır.");
    if (!piReady) return setMsg("Pi SDK hazır değil. Sayfayı yenile.");

    // Ödeme tutarı: order.price_pi varsa onu kullan; yoksa amount_pi
    const amount = Number(order.price_pi ?? order.amount_pi ?? 0);
    if (!amount || amount <= 0) return setMsg("Geçersiz tutar (Pi).");

    setPaying(true);

    try {
      // 1) Backend’den “payment identifier” üret
      const createRes = await fetch("/api/pi/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order_id: order.id,
          amount_pi: amount,
          memo: `TradePiGloball Order:${order.id}`,
        }),
      });

      const created = await createRes.json();
      if (!createRes.ok) throw new Error(created?.error || "Payment create failed");

      const paymentData = {
        amount: created.amount, // number
        memo: created.memo, // string
        metadata: created.metadata, // object
      };

      // 2) Pi ödeme ekranını aç (GERÇEK)
      window.Pi.createPayment(paymentData, {
        onReadyForServerApproval: async (piPaymentId) => {
          // Pi “approve” ister -> backend’e onaylat
          const r = await fetch("/api/pi/approve", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ pi_payment_id: piPaymentId, order_id: order.id }),
          });
          const j = await r.json();
          if (!r.ok) throw new Error(j?.error || "Approve failed");
        },

        onReadyForServerCompletion: async (piPaymentId, txid) => {
          // Pi “complete” ister -> backend’e tamamlat
          const r = await fetch("/api/pi/complete", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              pi_payment_id: piPaymentId,
              txid,
              order_id: order.id,
              amount_pi: amount,
            }),
          });
          const j = await r.json();
          if (!r.ok) throw new Error(j?.error || "Complete failed");

          setMsg("✅ Ödeme tamamlandı.");
          await refreshOrder();
        },

        onCancel: (piPaymentId) => {
          console.log("Payment cancelled:", piPaymentId);
          setMsg("Ödeme iptal edildi.");
        },

        onError: (err) => {
          console.error("Pi payment error:", err);
          setMsg(err?.message || "Pi ödeme hatası.");
        },
      });
    } catch (e) {
      console.error(e);
      setMsg(e.message || "Ödeme başlatılamadı.");
    } finally {
      setPaying(false);
    }
  }

  if (loading) {
    return (
      <div style={{ padding: 16 }}>
        <h2>Pi Payment</h2>
        <p>Loading...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div style={{ padding: 16 }}>
        <h2>Pi Payment</h2>
        <p>Order bulunamadı.</p>
        {msg ? <p style={{ opacity: 0.9 }}>{msg}</p> : null}
      </div>
    );
  }

  return (
    <div style={{ padding: 16, maxWidth: 720 }}>
      <button onClick={() => nav(-1)} style={{ marginBottom: 12 }}>
        ← Back
      </button>

      <h2 style={{ margin: 0 }}>Pi Payment</h2>
      <p style={{ marginTop: 6, opacity: 0.9 }}>
        Bu ekran gerçek Pi ödemesi içindir. Pi Browser ile açılmalıdır.
      </p>

      <div
        style={{
          marginTop: 12,
          padding: 14,
          borderRadius: 12,
          border: "1px solid rgba(255,255,255,.12)",
          background: "rgba(0,0,0,.25)",
        }}
      >
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <div>
            <div style={{ opacity: 0.7, fontSize: 12 }}>Order ID</div>
            <div style={{ fontFamily: "monospace" }}>{order.id}</div>
          </div>

          <div>
            <div style={{ opacity: 0.7, fontSize: 12 }}>Status</div>
            <div>{order.status}</div>
          </div>

          <div>
            <div style={{ opacity: 0.7, fontSize: 12 }}>Amount (Pi)</div>
            <div style={{ fontSize: 18, fontWeight: 700 }}>
              {money(order.price_pi ?? order.amount_pi ?? 0)} Pi
            </div>
          </div>
        </div>

        <div style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button
            onClick={startPiPayment}
            disabled={paying || !isPiBrowser}
            style={{
              padding: "10px 14px",
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,.18)",
              background: paying ? "rgba(255,255,255,.08)" : "rgba(80,140,255,.25)",
              cursor: paying ? "not-allowed" : "pointer",
              fontWeight: 700,
            }}
          >
            {paying ? "Opening Pi..." : "Pay with Pi"}
          </button>

          <button
            onClick={refreshOrder}
            style={{
              padding: "10px 14px",
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,.18)",
              background: "rgba(255,255,255,.06)",
              cursor: "pointer",
            }}
          >
            Refresh
          </button>
        </div>

        {!isPiBrowser ? (
          <div style={{ marginTop: 10, opacity: 0.85 }}>
            ⚠️ Pi SDK bulunamadı. Bu sayfayı **Pi Browser** ile aç.
          </div>
        ) : null}

        {msg ? <div style={{ marginTop: 10, opacity: 0.95 }}>{msg}</div> : null}
      </div>
    </div>
  );
}
