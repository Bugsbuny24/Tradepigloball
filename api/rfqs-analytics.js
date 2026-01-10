import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  const { rfq_id } = req.query;

  const { data, error } = await supabase
    .from("rfq_support_stats")
    .select("*")
    .eq("rfq_id", rfq_id)
    .order("hour", { ascending: true });

  if (error) return res.status(400).json({ error: error.message });

  res.json(data);
}
