import { createClient } from "@supabase/supabase-js";
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const { badge } = req.body;

  // Credit burn
  await supabase.rpc("burn_credit", {
    p_amount: 20,
    p_reason: `badge_apply_${badge}`
  });

  // Queue / direct assign (MVP: direct)
  await supabase.from("creator_badges").insert({
    user_id: req.headers["x-user-id"],
    badge
  });

  res.json({ ok: true });
}
