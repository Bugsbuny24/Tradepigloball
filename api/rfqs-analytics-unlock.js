import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  const { rfq_id } = req.body;

  await supabase.rpc("burn_credit", {
    p_amount: 20,
    p_reason: "rfq_analytics"
  });

  res.json({ ok: true });
}
