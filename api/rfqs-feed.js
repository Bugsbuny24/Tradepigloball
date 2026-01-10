import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  const { data } = await supabase
    .from("rfqs")
    .select("id,title,cover_url,current_credit,min_credit,is_featured,status")
    .order("is_featured", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(30);

  res.json(data || []);
}
