export default async function handler(req, res) {
  try {
    const token = process.env.PRINTIFY_API_KEY;

    // 1️⃣ Mağazaları al
    const shopsRes = await fetch("https://api.printify.com/v1/shops.json", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const shops = await shopsRes.json();
    const shopId = shops[0]?.id;

    if (!shopId) {
      return res.status(400).json({ error: "Shop bulunamadı" });
    }

    // 2️⃣ Ürünleri al
    const productsRes = await fetch(
      `https://api.printify.com/v1/shops/${shopId}/products.json`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const products = await productsRes.json();
    res.status(200).json(products.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
