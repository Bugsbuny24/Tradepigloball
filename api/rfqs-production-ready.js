import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { rfq_id, link } = req.body;

  const { error } = await supabase
    .from("rfqs")
    .update({
      status: "production_ready",
      external_link: link
    })
    .eq("id", rfq_id);

  if (error) return res.status(400).json({ error: error.message });

  res.json({ ok: true });
}
