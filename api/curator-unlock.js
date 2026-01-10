import { createClient } from "@supabase/supabase-js";
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const userId = req.headers["x-user-id"];

  // Credit burn
  await supabase.rpc("burn_credit", {
    p_amount: 50,
    p_reason: "curator_unlock"
  });

  await supabase.from("curator_roles").insert({
    user_id: userId
  });

  res.json({ ok: true });
}
