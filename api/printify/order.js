export default async function handler(req, res) {
  try {
    if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

    const token = process.env.PRINTIFY_TOKEN;
    if (!token) return res.status(500).json({ error: "Missing PRINTIFY_TOKEN" });

    const { cart, shipping } = req.body || {};
    if (!cart?.length) return res.status(400).json({ error: "Cart empty" });

    // 1) shop id bul
    const shopsRes = await fetch("https://api.printify.com/v1/shops.json", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const shops = await shopsRes.json();
    const shopId = Array.isArray(shops) ? shops[0]?.id : shops?.data?.[0]?.id;
    if (!shopId) return res.status(400).json({ error: "Shop bulunamadı", shops });

    // 2) Printify order payload
    // Printify order "line_items" için product_id + quantity yeter.
    // variant seçimi istersen ayrıca variant_id ekleriz.
    const line_items = cart.map(x => ({
      product_id: x.productId,
      quantity: x.qty
    }));

    const payload = {
      external_id: "TP-" + Date.now(),
      label: "TradePi Order",
      line_items,
      shipping_method: 1, // Printify kargo yöntemi; gerekiyorsa kaldırırız
      send_shipping_notification: true,
      address_to: {
        first_name: shipping?.first_name || "Test",
        last_name: shipping?.last_name || "User",
        email: shipping?.email || "test@example.com",
        phone: shipping?.phone || "+900000000000",
        country: shipping?.country || "TR",
        region: shipping?.region || "Istanbul",
        address1: shipping?.address1 || "Test Address",
        city: shipping?.city || "Istanbul",
        zip: shipping?.zip || "34000"
      }
    };

    const r = await fetch(`https://api.printify.com/v1/shops/${shopId}/orders.json`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const data = await r.json();
    if (!r.ok) return res.status(r.status).json({ error: "Printify order error", details: data });

    return res.status(200).json(data);
  } catch (e) {
    return res.status(500).json({ error: e.message || "Server error" });
  }
}
