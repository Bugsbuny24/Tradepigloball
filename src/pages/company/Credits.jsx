import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useSession } from "../../lib/session";

const PACKS = [
  { label: "10 credits", credits: 10, pricePi: 8 },
  { label: "25 credits", credits: 25, pricePi: 18 },
  { label: "50 credits", credits: 50, pricePi: 32 }
];

export default function Credits() {
  const { user } = useSession();
  const [balance, setBalance] = useState(0);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  async function refresh() {
    if (!user) return;
    const { data } = await supabase.from("rfq_credits").select("balance").eq("company_id", user.id).maybeSingle();
    setBalance(Number(data?.balance || 0));
  }

  useEffect(() => { refresh(); }, [user]);

  async function buy(pack) {
    setMsg("");
    setBusy(true);
    try {
      // 1) payment row
      const { data: pay, error } = await supabase
        .from("pi_payments")
        .insert({
          user_id: user.id,
          purpose: "rfq_topup",
          amount_pi: pack.pricePi,
          status: "created"
        })
        .select()
        .single();
      if (error) throw error;

      // 2) Pi ödeme (placeholder)
      const txid = `tx_${Date.now()}`; // TEMP

      // 3) verify+apply + credits
      const r = await fetch("/api/pi/verify-and-apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentId: pay.id, txid, credits: pack.credits })
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "verify failed");

      await refresh();
      setMsg("✅ Credits added!");
    } catch (e) {
      setMsg(`❌ ${e.message}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ padding: 16 }}>
      <h2>RFQ Credits</h2>
      <p>Balance: <b>{balance}</b></p>

      <div style={{ display: "grid", gap: 10, maxWidth: 420 }}>
        {PACKS.map(p => (
          <button key={p.label} disabled={!user || busy} onClick={() => buy(p)}>
            {busy ? "Processing..." : `${p.label} — ${p.pricePi} Pi`}
          </button>
        ))}
      </div>

      {msg && <p style={{ marginTop: 12 }}>{msg}</p>}
    </div>
  );
}
