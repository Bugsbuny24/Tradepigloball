import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { rfq_id, qty } = req.body;

  const { error } = await supabase.rpc("support_rfq", {
    p_rfq_id: rfq_id,
    p_qty: qty || 1,
    p_idempotency_key: crypto.randomUUID()
  });

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json({ ok: true });
}
