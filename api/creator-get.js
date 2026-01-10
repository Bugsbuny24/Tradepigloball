import { createClient } from "@supabase/supabase-js";
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  const { user_id } = req.query;

  const { data: profile, error } = await supabase
    .from("creator_profiles")
    .select("*")
    .eq("user_id", user_id)
    .single();

  if (error) return res.status(404).json({ error: error.message });

  const { data: badges } = await supabase
    .from("creator_badges")
    .select("badge")
    .eq("user_id", user_id);

  const { data: rfqs } = await supabase
    .from("rfqs")
    .select("id,title,status")
    .eq("creator_id", user_id)
    .order("created_at", { ascending: false })
    .limit(6);

  res.json({ profile, badges, rfqs });
}
