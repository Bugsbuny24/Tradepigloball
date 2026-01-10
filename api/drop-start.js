import { createClient } from "@supabase/supabase-js";
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { rfq_id, starts_at, ends_at } = req.body;

  await supabase.rpc("burn_credit", {
    p_amount: 20,
    p_reason: "drop_start"
  });

  await supabase.from("rfqs").update({
    is_drop: true,
    drop_starts_at: starts_at,
    drop_ends_at: ends_at,
    status: "open"
  }).eq("id", rfq_id);

  res.json({ ok: true });
}
