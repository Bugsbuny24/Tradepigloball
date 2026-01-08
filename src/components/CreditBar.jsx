import React from "react";
import { supabase } from "../lib/supabaseClient";
import { getAuthDebug } from "../lib/debugAuth";

const PACKS = [
  { label: "10 Credits", amount: 10 },
  { label: "50 Credits", amount: 50 },
  { label: "200 Credits", amount: 200 },
];

export default function Credits() {
  const [authDbg, setAuthDbg] = React.useState(null);
  const [balance, setBalance] = React.useState(null);
  const [err, setErr] = React.useState("");
  const [ok, setOk] = React.useState("");
  const [busy, setBusy] = React.useState(false);

  async function load() {
    setErr("");
    setOk("");
    setBalance(null);

    const dbg = await getAuthDebug();
    setAuthDbg(dbg);
    if (!dbg?.userId) return;

    // 1) RPC varsa
    const r = await supabase.rpc("rpc_wallet_me");
    if (!r.error) {
      const n = typeof r.data === "number" ? r.data : Number(r.data) || 0;
      setBalance(n);
      return;
    }

    // 2) fallback: user_wallets
    const w = await supabase.from("user_wallets").select("balance").eq("user_id", dbg.userId).maybeSingle();
    if (!w.error) setBalance(Number(w.data?.balance ?? 0));
  }

  React.useEffect(() => {
    load();
    const { data: sub } = supabase.auth.onAuthStateChange(() => load());
    return () => sub?.subscription?.unsubscribe?.();
  }, []);

  async function grant(amount) {
    setBusy(true);
    setErr("");
    setOk("");
    try {
      if (!authDbg?.userId) throw new Error("Login required");
      // Owner grant RPC (senin DB’de var diye konuştuk)
      const { data, error } = await supabase.rpc("rpc_credit_grant_owner", {
        p_user_id: authDbg.userId,
        p_amount: amount,
        p_note: `credit pack ${amount}`,
      });
      if (error) throw error;

      const n = typeof data === "number" ? data : Number(data);
      if (!Number.isNaN(n)) setBalance(n);
      setOk(`Loaded ${amount} credits ✅`);
    } catch (e) {
      setErr(e?.message || "Grant error (RPC / RLS?)");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={page}>
      <div style={card}>
        <h2 style={{ margin: 0 }}>Credits</h2>
        <div style={{ opacity: 0.75, marginTop: 6 }}>
          Kredi biter mi? <b>Evet kanka 😄</b> — işte gelir modeli bu.
        </div>

        <div style={dbgBox}>
          <b>Auth Debug</b>
          <div>userId: {authDbg?.userId ?? "-"}</div>
          <div>email: {authDbg?.email ?? "-"}</div>
        </div>

        <div style={{ marginTop: 10 }}>
          <b>Balance:</b> {balance === null ? "..." : balance}
        </div>

        {err ? <div style={errBox}><b>Hata:</b> {err}</div> : null}
        {ok ? <div style={okBox}>{ok}</div> : null}

        <div style={{ marginTop: 12, display: "grid", gap: 10, maxWidth: 420 }}>
          {PACKS.map((p) => (
            <button key={p.amount} disabled={busy || !authDbg?.userId} style={btn2} onClick={() => grant(p.amount)}>
              {busy ? "Working…" : `Load ${p.label}`}
            </button>
          ))}
          <button style={btn} onClick={load}>Refresh</button>
        </div>

        <div style={{ marginTop: 14, opacity: 0.7 }}>
          Not: Bu ekran şimdilik “owner grant” ile yükler. Pi SDK gelince aynı ekran “Pay with Pi → credit pack” olur.
        </div>
      </div>
    </div>
  );
}

const page = { padding: 16, maxWidth: 980, margin: "0 auto" };
const card = { padding: 16, borderRadius: 16, border: "1px solid rgba(255,255,255,.12)", background: "rgba(0,0,0,.22)" };
const dbgBox = { marginTop: 12, padding: 10, border: "1px dashed #555", borderRadius: 12 };
const btn = { padding: 12, borderRadius: 14, background: "#6d5cff", color: "white", border: "none", fontWeight: 900, cursor: "pointer" };
const btn2 = { padding: 12, borderRadius: 14, background: "rgba(255,255,255,.06)", color: "white", border: "1px solid rgba(255,255,255,.14)", fontWeight: 900, cursor: "pointer" };
const errBox = { marginTop: 12, padding: 12, borderRadius: 12, border: "1px solid rgba(255,0,0,.25)", background: "rgba(255,0,0,.06)" };
const okBox = { marginTop: 12, padding: 12, borderRadius: 12, border: "1px solid rgba(0,255,0,.18)", background: "rgba(0,255,0,.06)" };
