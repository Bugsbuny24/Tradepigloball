export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { order_id, amount_pi, memo } = req.body || {};
    if (!order_id) return res.status(400).json({ error: "order_id required" });
    if (!amount_pi || Number(amount_pi) <= 0) return res.status(400).json({ error: "amount_pi invalid" });

    // Pi SDK createPayment için metadata gönderiyoruz
    return res.status(200).json({
      amount: Number(amount_pi),
      memo: memo || `TradePiGloball Order:${order_id}`,
      metadata: { order_id },
    });
  } catch (e) {
    return res.status(500).json({ error: e.message || "create failed" });
  }
}
