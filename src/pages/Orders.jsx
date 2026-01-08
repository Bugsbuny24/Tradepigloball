import React from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export default function Orders() {
  const nav = useNavigate();
  const [loading, setLoading] = React.useState(true);
  const [err, setErr] = React.useState("");
  const [orders, setOrders] = React.useState([]);
  const [me, setMe] = React.useState(null);

  async function load() {
    setLoading(true);
    setErr("");
    try {
      const { data: u } = await supabase.auth.getUser();
      const uid = u?.user?.id || null;
      setMe(uid);

      if (!uid) {
        setOrders([]);
        setLoading(false);
        return;
      }

      // buyer OR seller olan orderları çek
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .or(`buyer_id.eq.${uid},seller_id.eq.${uid}`)
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;
      setOrders(data || []);
    } catch (e) {
      setErr(e?.message || "Load error");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    load();
    const { data: sub } = supabase.auth.onAuthStateChange(() => load());
    return () => sub?.subscription?.unsubscribe?.();
  }, []);

  return (
    <div style={page}>
      <div style={card}>
        <h2 style={{ margin: 0 }}>Orders</h2>
        <div style={{ opacity: 0.75, marginTop: 6 }}>
          Login olan kullanıcı: <b>{me || "-"}</b>
        </div>

        {err ? <div style={errBox}><b>Hata:</b> {err}</div> : null}

        {loading ? (
          <div style={{ marginTop: 12 }}>Loading…</div>
        ) : !me ? (
          <div style={{ marginTop: 12 }}>Login ol kanka.</div>
        ) : orders.length === 0 ? (
          <div style={{ marginTop: 12, opacity: 0.8 }}>No orders yet.</div>
        ) : (
          <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
            {orders.map((o) => (
              <div key={o.id} style={row}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                  <div style={{ fontWeight: 900 }}>#{o.id.slice(0, 8)}</div>
                  <span style={badge}>{o.status}</span>
                </div>
                <div style={{ opacity: 0.8, marginTop: 6 }}>
                  Amount: <b>{o.amount_pi}</b> Pi
                </div>
                <div style={{ opacity: 0.7, marginTop: 6, fontSize: 12 }}>
                  Buyer: {o.buyer_id} <br />
                  Seller: {o.seller_id}
                </div>
                <div style={{ marginTop: 10 }}>
                  <button style={btn2} onClick={() => nav(`/orders/${o.id}`)}>
                    Open
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{ marginTop: 14, opacity: 0.7 }}>
          Not: Orders görünmüyorsa orders SELECT policy taraf (buyer/seller) için açık olmalı.
        </div>
      </div>
    </div>
  );
}

const page = { padding: 16, maxWidth: 980, margin: "0 auto" };
const card = { padding: 16, borderRadius: 16, border: "1px solid rgba(255,255,255,.12)", background: "rgba(0,0,0,.22)" };
const row = { padding: 12, borderRadius: 14, border: "1px solid rgba(255,255,255,.10)", background: "rgba(255,255,255,.03)" };
const btn2 = { padding: "10px 14px", borderRadius: 12, border: "1px solid rgba(255,255,255,.14)", background: "rgba(255,255,255,.06)", color: "white", fontWeight: 900, cursor: "pointer" };
const badge = { padding: "4px 10px", borderRadius: 999, border: "1px solid rgba(255,255,255,.16)", background: "rgba(255,255,255,.06)", fontSize: 12, fontWeight: 900 };
const errBox = { marginTop: 12, padding: 12, borderRadius: 12, border: "1px solid rgba(255,0,0,.25)", background: "rgba(255,0,0,.06)" };
