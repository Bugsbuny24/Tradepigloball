import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Basit doğrulama: şimdilik "txid geldi = paid".
// (Sonra gerçek Pi doğrulama ekleyeceğiz.)
export default async function handler(req, res) {
  try {
    if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

    const { paymentId, txid, credits } = req.body || {};
    if (!paymentId || !txid) return res.status(400).json({ error: "paymentId and txid are required" });

    // Payment kaydını oku
    const { data: payment, error: pErr } = await supabaseAdmin
      .from("pi_payments")
      .select("id, user_id, purpose, amount_pi, status")
      .eq("id", paymentId)
      .single();

    if (pErr) return res.status(400).json({ error: pErr.message });
    if (payment.status === "paid") return res.status(200).json({ ok: true, alreadyPaid: true });

    // Payment'ı PAID yap + txid yaz
    const { error: uErr } = await supabaseAdmin
      .from("pi_payments")
      .update({ status: "paid", txid })
      .eq("id", paymentId);

    if (uErr) return res.status(400).json({ error: uErr.message });

    // Purpose'a göre RPC uygula
    if (payment.purpose === "subscription") {
      const { error } = await supabaseAdmin.rpc("apply_subscription_payment", { p_payment_id: paymentId });
      if (error) return res.status(400).json({ error: error.message });
      return res.status(200).json({ ok: true, applied: "subscription" });
    }

    if (payment.purpose === "rfq_topup") {
      const creditsNum = Number(credits);
      if (!creditsNum || creditsNum <= 0) return res.status(400).json({ error: "credits must be > 0" });

      const { error } = await supabaseAdmin.rpc("apply_rfq_topup_payment", {
        p_payment_id: paymentId,
        p_credits: creditsNum
      });
      if (error) return res.status(400).json({ error: error.message });
      return res.status(200).json({ ok: true, applied: "rfq_topup", credits: creditsNum });
    }

    // featured vb. ileride
    return res.status(200).json({ ok: true, applied: "noop" });
  } catch (e) {
    return res.status(500).json({ error: e?.message || "Server error" });
  }
}
