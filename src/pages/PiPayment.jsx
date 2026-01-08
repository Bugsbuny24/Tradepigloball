import React from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { getAuthDebug } from "../lib/debugAuth";

export default function PiPayment() {
  const { orderId } = useParams();
  const [authDbg, setAuthDbg] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [payments, setPayments] = React.useState([]);

  async function load() {
    const dbg = await getAuthDebug();
    setAuthDbg(dbg);

    const { data, error } = await supabase
      .from("pi_payments")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20);

    if (!error) setPayments(data || []);
  }

  React.useEffect(() => {
    load();
  }, [orderId]);

  async function createPiPayment() {
    const dbg = await getAuthDebug();
    setAuthDbg(dbg);

    if (!dbg?.userId) {
      alert("Önce login ol kanka.");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from("pi_payments").insert({
        user_id: dbg.userId,
        status: "created",
        // order_id kolonun varsa ekle:
        // order_id: orderId,
      });

      if (error) throw error;

      alert("Pi payment created ✅");
      await load();
    } catch (e) {
      alert(e?.message || "Hata");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: 16 }}>
      <h2>Pi Payment</h2>

      <div style={card}>
        <div><b>Order ID:</b> {orderId}</div>
        <div style={{ opacity: 0.85 }}>Status: created → (Pi SDK later)</div>
      </div>

      <div style={dbgBox}>
        <b>Auth Debug</b>
        <div>userId: {authDbg?.userId ?? "-"}</div>
        <div>email: {authDbg?.email ?? "-"}</div>
      </div>

      <button onClick={createPiPayment} disabled={loading} style={btn}>
        {loading ? "Working..." : "Create Pi Payment"}
      </button>

      <h3 style={{ marginTop: 18 }}>Recent pi_payments</h3>
      <div style={{ display: "grid", gap: 10 }}>
        {payments.length ? payments.map(p => (
          <div key={p.id} style={mini}>
            <div><b>status:</b> {p.status}</div>
            <div style={{ opacity: 0.8 }}><b>id:</b> {p.id}</div>
            <div style={{ opacity: 0.8 }}><b>created_at:</b> {p.created_at}</div>
          </div>
        )) : <div style={{ opacity: 0.8 }}>No pi payments yet.</div>}
      </div>
    </div>
  );
}

const card = {
  padding: 12,
  borderRadius: 12,
  background: "rgba(0,0,0,.18)",
  border: "1px solid rgba(255,255,255,.08)",
  marginBottom: 12,
};
const btn = {
  padding: "12px 16px",
  borderRadius: 12,
  border: "none",
  background: "#6d5cff",
  color: "white",
  fontWeight: 900,
  cursor: "pointer",
  marginBottom: 12,
};
const mini = {
  padding: 10,
  borderRadius: 10,
  background: "rgba(255,255,255,.06)",
};
const dbgBox = { margin: "12px 0", padding: 10, border: "1px dashed #555", borderRadius: 12 };
