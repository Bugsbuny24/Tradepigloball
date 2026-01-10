import { createClient } from "@supabase/supabase-js";
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  const { collab_id } = req.query;

  const { data: collab } = await supabase
    .from("collabs")
    .select("*")
    .eq("id", collab_id)
    .single();

  const { data: members } = await supabase
    .from("collab_members")
    .select("user_id, role")
    .eq("collab_id", collab_id);

  res.json({ collab, members });
}
