import axios from "axios";

export default async function handler(req, res) {
  try {
    const api = axios.create({
      baseURL: "https://api.printify.com/v1",
      headers: {
        Authorization: `Bearer ${process.env.PRINTIFY_API_KEY}`,
        "Content-Type": "application/json"
      }
    });

    // 1️⃣ shop id al
    const shopsRes = await api.get("/shops.json");
    const shopId = shopsRes.data[0]?.id;
    if (!shopId) throw new Error("Shop ID bulunamadı");

    // 2️⃣ ürünleri al
    const productsRes = await api.get(`/shops/${shopId}/products.json`);

    res.status(200).json({
      shopId,
      products: productsRes.data.data
    });
  } catch (err) {
    res.status(500).json({
      error: "Printify products error",
      details: err?.response?.data || err.message
    });
  }
}
