import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  const { companyId, rfqId, message } = req.body;
  if (!companyId || !rfqId || !message)
    return res.status(400).json({ error: "Missing fields" });

  try {
    // 1️⃣ kredi düş
    const { error: spendErr } = await supabase.rpc(
      "spend_rfq_credit",
      {
        p_company_id: companyId,
        p_rfq_id: rfqId
      }
    );

    if (spendErr) {
      if (spendErr.message.includes("INSUFFICIENT_CREDITS")) {
        return res.status(402).json({ error: "No RFQ credits left" });
      }
      throw spendErr;
    }

    // 2️⃣ RFQ response kaydet
    const { error: insErr } = await supabase
      .from("rfq_items")
      .insert({
        rfq_id: rfqId,
        company_id: companyId,
        message
      });

    if (insErr) throw insErr;

    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
