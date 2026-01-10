import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const COSTS = {
  24: 10,   // 24 saat
  72: 25,   // 3 gün
  168: 50   // 7 gün
};

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { rfq_id, hours } = req.body;
  const cost = COSTS[hours];
  if (!cost) return res.status(400).json({ error: "invalid duration" });

  // Credit burn (RPC veya direkt ledger)
  const { error: burnErr } = await supabase.rpc("burn_credit", {
    p_amount: cost,
    p_reason: "rfq_feature"
  });
  if (burnErr) return res.status(400).json({ error: burnErr.message });

  // RFQ update
  const until = new Date(Date.now() + hours * 3600 * 1000).toISOString();
  const { error } = await supabase
    .from("rfqs")
    .update({
      is_featured: true,
      featured_until: until,
      featured_cost: cost
    })
    .eq("id", rfq_id);

  if (error) return res.status(400).json({ error: error.message });

  res.json({ ok: true });
}
