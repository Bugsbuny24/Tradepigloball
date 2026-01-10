// api/rfq-support.js
import { createClient } from "@supabase/supabase-js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
  );

  const { rfq_id, idempotency_key } = req.body;

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (!user) return res.status(401).json({ error: "unauthorized" });

  const { error } = await supabase.rpc("support_rfq", {
    p_rfq_id: rfq_id,
    p_qty: 1,
    p_idempotency_key: idempotency_key
  });

  if (error) return res.status(400).json({ error: error.message });

  res.json({ ok: true });
}
