export default async function handler(req, res) {
  try {
    const token = process.env.PRINTIFY_TOKEN;
    if (!token) return res.status(500).json({ error: "Missing PRINTIFY_TOKEN" });

    // 1) Shops al
    const shopsRes = await fetch("https://api.printify.com/v1/shops.json", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const shops = await shopsRes.json();

    const shopId = Array.isArray(shops) ? shops[0]?.id : shops?.data?.[0]?.id;
    if (!shopId) return res.status(400).json({ error: "Shop bulunamadı", shops });

    // 2) Products al
    const productsRes = await fetch(
      `https://api.printify.com/v1/shops/${shopId}/products.json`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const products = await productsRes.json();

    if (!productsRes.ok) return res.status(productsRes.status).json(products);

    // debug için shopId’yi de dönelim
    return res.status(200).json({ shopId, ...products });
  } catch (e) {
    return res.status(500).json({ error: e.message || "Server error" });
  }
}
