import { createClient } from "@supabase/supabase-js";
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const { rfq_id } = req.body;
  const userId = req.headers["x-user-id"];

  await supabase.rpc("burn_credit", {
    p_amount: 5,
    p_reason: "drop_join"
  });

  await supabase.from("drop_participants").insert({
    rfq_id,
    user_id: userId
  });

  res.json({ ok: true });
}
