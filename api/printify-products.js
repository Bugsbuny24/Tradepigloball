export default async function handler(req, res) {
  try {
    const token = process.env.PRINTIFY_TOKEN;
    const shopId = process.env.PRINTIFY_SHOP_ID;

    if (!token || !shopId) {
      return res.status(500).json({ error: "Missing PRINTIFY_TOKEN or PRINTIFY_SHOP_ID" });
    }

    const r = await fetch(`https://api.printify.com/v1/shops/${shopId}/products.json`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await r.json();
    if (!r.ok) return res.status(r.status).json(data);

    // Printify liste dönüyor: { current_page, data:[...] }
    return res.status(200).json(data);
  } catch (e) {
    return res.status(500).json({ error: e.message || "Server error" });
  }
}
