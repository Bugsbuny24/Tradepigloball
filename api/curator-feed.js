import { createClient } from "@supabase/supabase-js";
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  const { data } = await supabase
    .from("rfqs")
    .select("id,title,current_credit,min_credit")
    .eq("status", "open")
    .order("created_at", { ascending: false })
    .limit(20);

  res.json(data || []);
}
