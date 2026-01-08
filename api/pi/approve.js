export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { pi_payment_id } = req.body || {};
    if (!pi_payment_id) return res.status(400).json({ error: "pi_payment_id required" });

    // GERÇEK projede burada Pi Platform API ile APPROVE çağrısı yapılır.
    // (Server-side secret key gerekir.)
    // Şimdilik success döndürüyoruz; ama complete için yine server zorunlu.

    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(500).json({ error: e.message || "approve failed" });
  }
}
