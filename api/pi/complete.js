export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { order_id, txid, amount_pi } = req.body || {};
    if (!order_id) return res.status(400).json({ error: "order_id required" });
    if (!txid) return res.status(400).json({ error: "txid required" });

    // GERÇEK projede burada:
    // 1) Pi Platform API ile payment complete/verify
    // 2) Supabase'e pi_payments insert + orders status = 'paid'
    //
    // Bunu doğru yapmak için server tarafında SUPABASE_SERVICE_ROLE_KEY gerekir.

    return res.status(200).json({ ok: true, order_id, txid, amount_pi });
  } catch (e) {
    return res.status(500).json({ error: e.message || "complete failed" });
  }
}
