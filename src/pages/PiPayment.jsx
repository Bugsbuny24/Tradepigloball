import React from "react";
import { supabase } from "../lib/supabase";
import { getAuthDebug } from "../lib/debugAuth";

export default function PiPayment() {
  const [authDbg, setAuthDbg] = React.useState(null);
  const [amount, setAmount] = React.useState("1");
  const [note, setNote] = React.useState("topup");
  const [loading, setLoading] = React.useState(false);
  const [items, setItems] = React.useState([]);

  async function load() {
    const dbg = await getAuthDebug();
    setAuthDbg(dbg);

    const { data, error } = await supabase
      .from("pi_payments")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(30);

    if (!error) setItems(data || []);
  }

  React.useEffect(() => {
    load();
    const { data: sub } = supabase.auth.onAuthStateChange(() => load());
    return () => sub?.subscription?.unsubscribe?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function createPayment() {
    try {
      setLoading(true);

      const dbg = await getAuthDebug();
      setAuthDbg(dbg);

      if (!dbg?.userId) {
        alert("Önce login ol kanka.");
        return;
      }

      const amt = Number(amount);
      if (!Number.isFinite(amt) || amt <= 0) {
        alert("Amount düzgün gir kanka (ör: 1).");
        return;
      }

      // ✅ Basit kayıt (senin şemaya göre kolonlar farklıysa söyle, ayarlarız)
      const { error } = await supabase.from("pi_payments").insert({
        user_id: dbg.userId,
        status: "created",
        // Eğer kolonların varsa:
        // amount_pi: amt,
        // note: note,
      });

      if (error) throw error;

      alert("Pi Payment created ✅");
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
        <b>Auth Debug</b>
        <div>userId: {authDbg?.userId ?? "-"}</div>
        <div>email: {authDbg?.email ?? "-"}</div>
        <div>error: {authDbg?.error ?? "-"}</div>
      </div>

      <div style={{ marginTop: 12, ...card }}>
        <b>Yeni Pi Payment</b>

        <div style={{ display: "grid", gap: 10, marginTop: 10, maxWidth: 420 }}>
          <input
            style={inp}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Amount (Pi)"
          />
          <input
            style={inp}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Note"
          />
          <button style={btn} onClick={createPayment} disabled={loading}>
            {loading ? "Working..." : "Create Pi Payment"}
          </button>
        </div>
      </div>

      <div style={{ marginTop: 16 }}>
        <b>Son Ödemeler</b>
        <div style={{ display: "grid", gap: 10, marginTop: 10 }}>
          {items.length ? (
            items.map((x) => (
              <div key={x.id} style={card}>
                <div><b>status:</b> {x.status}</div>
                <div style={{ opacity: 0.8 }}><b>id:</b> {x.id}</div>
                <div style={{ opacity: 0.8 }}><b>created:</b> {x.created_at}</div>
              </div>
            ))
          ) : (
            <div style={card}>Henüz payment yok.</div>
          )}
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
};

const btn = {
  padding: 12,
  borderRadius: 14,
  background: "#6d5cff",
  color: "white",
  border: "none",
};

const card = {
  padding: 12,
  borderRadius: 12,
  background: "rgba(0,0,0,.18)",
  border: "1px solid rgba(255,255,255,.08)",
  color: "white",
};
