import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useSession } from "../../lib/session"; // sende nasıl isimlendiyse

export default function Billing() {
  const { user } = useSession();
  const [plans, setPlans] = useState([]);
  const [sub, setSub] = useState(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    (async () => {
      const { data: p } = await supabase.from("plans").select("*").order("price_pi_monthly", { ascending: true });
      setPlans(p || []);

      if (!user) return;
      const { data: s } = await supabase
        .from("subscriptions")
        .select("plan_id,status,current_period_end")
        .eq("company_id", user.id)
        .maybeSingle();
      setSub(s || null);
    })();
  }, [user]);

  async function upgrade(planId) {
    setMsg("");
    setBusy(true);
    try {
      const plan = plans.find(x => x.id === planId);
      if (!plan) throw new Error("Plan not found");

      // 1) payment row
      const { data: pay, error } = await supabase
        .from("pi_payments")
        .insert({
          user_id: user.id,
          purpose: "subscription",
          amount_pi: plan.price_pi_monthly,
          status: "created"
        })
        .select()
        .single();
      if (error) throw error;

      // 2) Pi SDK ödeme (şimdilik placeholder)
      // Buraya Pi ödeme çağrını koyacağız.
      const txid = `tx_${Date.now()}`; // TEMP

      // 3) verify+apply
      const r = await fetch("/api/pi/verify-and-apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentId: pay.id, txid })
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "verify failed");

      setMsg("✅ Abonelik aktif edildi!");
      const { data: s } = await supabase
        .from("subscriptions")
        .select("plan_id,status,current_period_end")
        .eq("company_id", user.id)
        .maybeSingle();
      setSub(s || null);
    } catch (e) {
      setMsg(`❌ ${e.message}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ padding: 16 }}>
      <h2>Billing</h2>

      {sub ? (
        <p>
          Current: <b>{sub.plan_id}</b> — until {new Date(sub.current_period_end).toLocaleString()}
        </p>
      ) : (
        <p>Current: <b>free</b></p>
      )}

      <div style={{ display: "grid", gap: 12, maxWidth: 520 }}>
        {plans.map(p => (
          <div key={p.id} style={{ border: "1px solid #ddd", padding: 12, borderRadius: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <b>{p.name}</b>
              <span>{p.price_pi_monthly} Pi / month</span>
            </div>
            <div style={{ marginTop: 8, fontSize: 14 }}>
              Product limit: {p.product_limit}<br />
              Included RFQ responses: {p.rfq_responses_included}<br />
              Featured: {p.featured_included ? "Yes" : "No"}
            </div>

            {p.id !== "free" && (
              <button disabled={busy || !user} onClick={() => upgrade(p.id)} style={{ marginTop: 10 }}>
                {busy ? "Processing..." : `Upgrade to ${p.name}`}
              </button>
            )}
          </div>
        ))}
      </div>

      {msg && <p style={{ marginTop: 12 }}>{msg}</p>}
    </div>
  );
            }
