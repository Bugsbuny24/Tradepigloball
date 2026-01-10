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
    p_amount: 15,
    p_reason: "collab_create"
  });

  const { data: collab } = await supabase
    .from("collabs")
    .insert({ rfq_id, owner_id: userId })
    .select()
    .single();

  await supabase.from("collab_members").insert({
    collab_id: collab.id,
    user_id: userId,
    role: "owner"
  });

  res.json(collab);
}
