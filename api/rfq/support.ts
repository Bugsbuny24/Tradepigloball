import { spendCredit } from "../credit/spend";

export default async function handler(req, res) {
  const { user, rfq_id } = req.body;

  await spendCredit({
    user_id: user.id,
    amount: 5,
    reason: "rfq_support",
    ref_type: "rfq",
    ref_id: rfq_id,
    idempotency_key: `${user.id}:${rfq_id}`
  });

  await supabase
    .from("rfq_supports")
    .insert({ rfq_id, supporter_id: user.id });

  await supabase.rpc("rfq_recalc_status", { p_rfq_id: rfq_id });

  res.json({ ok: true });
}
