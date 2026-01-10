import { createClient } from "@supabase/supabase-js";
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const { collab_id, user_id } = req.body;

  await supabase.rpc("burn_credit", {
    p_amount: 5,
    p_reason: "collab_invite"
  });

  await supabase.from("collab_members").insert({
    collab_id,
    user_id,
    role: "contributor"
  });

  res.json({ ok: true });
}
