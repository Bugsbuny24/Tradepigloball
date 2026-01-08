import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [me, setMe] = useState(null);
  const [busy, setBusy] = useState(false);

  const styles = useMemo(() => {
    const page = {
      minHeight: "calc(100vh - 64px)",
      padding: "22px 14px",
      background:
        "radial-gradient(900px 520px at 20% 0%, rgba(99,102,241,.22), transparent 60%), radial-gradient(900px 520px at 80% 10%, rgba(34,197,94,.16), transparent 55%), linear-gradient(180deg, rgba(15,23,42,1), rgba(2,6,23,1))",
      color: "#e5e7eb",
    };

    const wrap = { maxWidth: 1100, margin: "0 auto" };

    const headerRow = {
      display: "flex",
      alignItems: "flex-end",
      justifyContent: "space-between",
      gap: 12,
      flexWrap: "wrap",
      marginBottom: 14,
    };

    const h1 = { margin: 0, fontSize: 28, letterSpacing: 0.2 };
    const sub = { opacity: 0.85, marginTop: 6, lineHeight: 1.5 };

    const card = {
      border: "1px solid rgba(255,255,255,.10)",
      background:
        "linear-gradient(180deg, rgba(255,255,255,.06), rgba(255,255,255,.03))",
      borderRadius: 18,
      padding: 16,
      boxShadow: "0 14px 40px rgba(0,0,0,.35)",
      backdropFilter: "blur(10px)",
    };

    const badge = {
      fontSize: 12,
      padding: "6px 10px",
      borderRadius: 999,
      border: "1px solid rgba(255,255,255,.14)",
      background: "rgba(255,255,255,.06)",
      opacity: 0.95,
    };

    const list = { display: "grid", gap: 10, marginTop: 10 };

    const row = {
      display: "flex",
      justifyContent: "space-between",
      gap: 12,
      padding: 12,
      borderRadius: 14,
      border: "1px solid rgba(255,255,255,.10)",
      background: "rgba(255,255,255,.04)",
      textDecoration: "none",
      color: "#e5e7eb",
      alignItems: "center",
    };

    const title = { margin: 0, fontWeight: 900 };
    const meta = { fontSize: 12, opacity: 0.8, marginTop: 4 };
    const right = { textAlign: "right", fontSize: 12, opacity: 0.85 };

    const btn = {
      padding: "10px 12px",
      borderRadius: 12,
      border: "1px solid rgba(255,255,255,.14)",
      background: "rgba(255,255,255,.06)",
      color: "#e5e7eb",
      fontWeight: 800,
      cursor: "pointer",
      opacity: busy ? 0.7 : 1,
    };

    return { page, wrap, headerRow, h1, sub, card, badge, list, row, title, meta, right, btn };
  }, [busy]);

  async function load() {
    setBusy(true);
    try {
      const { data: s } = await supabase.auth.getSession();
      const uid = s?.session?.user?.id || null;
      setMe(uid);

      if (!uid) {
        setOrders([]);
        return;
      }

      const { data, error } = await supabase
        .from("orders")
        .select("id, rfq_id, offer_id, buyer_id, seller_id, amount_pi, status, created_at")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Ben buyer ya da seller isem göreyim:
      const mine = (data || []).filter((o) => o.buyer_id === uid || o.seller_id === uid);
      setOrders(mine);
    } catch (e) {
      alert(e?.message || "Orders load error");
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={styles.page}>
      <div style={styles.wrap}>
        <div style={styles.headerRow}>
          <div>
            <h2 style={styles.h1}>Orders</h2>
            <div style={styles.sub}>
              Offer kabul edilince oluşan order’lar burada listelenir. Payment demo ekranı
              order detail’den açılır.
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <div style={styles.badge}>
              Me:{" "}
              <b style={{ fontFamily: "monospace" }}>
                {me ? me.slice(0, 8) + "…" : "null"}
              </b>
            </div>
            <div style={styles.badge}>
              Total: <b>{orders.length}</b>
            </div>
            <button style={styles.btn} onClick={load} disabled={busy}>
              {busy ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </div>

        <div style={styles.card}>
          <div style={{ fontWeight: 900 }}>My Orders</div>

          <div style={styles.list}>
            {orders.length === 0 ? (
              <div style={{ opacity: 0.75, padding: 10 }}>No orders yet.</div>
            ) : (
              orders.map((o) => (
                <Link key={o.id} to={`/orders/${o.id}`} style={styles.row}>
                  <div>
                    <p style={styles.title}>
                      Order • <span style={{ fontFamily: "monospace" }}>{o.id.slice(0, 8)}…</span>
                    </p>
                    <div style={styles.meta}>
                      Status: <b>{o.status}</b> • Amount: <b>{o.amount_pi ?? 0}</b> π
                      <br />
                      {o.created_at ? new Date(o.created_at).toLocaleString() : "-"}
                    </div>
                  </div>

                  <div style={styles.right}>
                    <div style={{ opacity: 0.9 }}>Detail →</div>
                    <div style={{ opacity: 0.7, marginTop: 4 }}>
                      RFQ: <span style={{ fontFamily: "monospace" }}>{(o.rfq_id || "").slice(0, 6)}…</span>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        <div style={{ marginTop: 12, opacity: 0.7, fontSize: 12 }}>
          Not: Order status “pending_payment” ise PiPayment sayfası üzerinden demo akış yapılır.
        </div>
      </div>
    </div>
  );
}
