import { supabaseUser } from "./_lib/supabase.js";
import crypto from "crypto";

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") return res.status(405).json({ ok: false, error: "Method not allowed" });

    const { rfqId } = req.body || {};
    if (!rfqId) return res.status(400).json({ ok: false, error: "Missing rfqId" });

    const supabase = supabaseUser(req);

    const { error } = await supabase.rpc("support_rfq", {
      p_rfq_id: rfqId,
      p_qty: 1,
      p_idempotency_key: crypto.randomUUID(),
    });

    if (error) return res.status(400).json({ ok: false, error: error.message });

    return res.json({ ok: true });
  } catch (e) {
    return res.status(500).json({ ok: false, error: String(e?.message || e) });
  }
}
