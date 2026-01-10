import express from "express";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

const PRINTIFY_BASE = "https://api.printify.com/v1";
const api = axios.create({
  baseURL: PRINTIFY_BASE,
  headers: {
    Authorization: `Bearer ${process.env.PRINTIFY_API_KEY}`,
    "Content-Type": "application/json",
  },
  timeout: 20000,
});

// Basit health
app.get("/health", (_, res) => res.json({ ok: true }));

/**
 * 1) Shops listele (SHOP_ID bulmak için)
 */
app.get("/printify/shops", async (_, res) => {
  try {
    const r = await api.get("/shops.json");
    res.json(r.data);
  } catch (e) {
    res.status(500).json({ error: e?.response?.data ?? e.message });
  }
});

/**
 * 2) Shop ürünlerini listele (product_id / variants görmek için)
 * Query: ?limit=20&page=1 gibi
 */
app.get("/printify/products", async (req, res) => {
  try {
    const shopId = process.env.PRINTIFY_SHOP_ID;
    if (!shopId) return res.status(400).json({ error: "PRINTIFY_SHOP_ID missing" });

    const limit = Number(req.query.limit ?? 20);
    const page = Number(req.query.page ?? 1);

    const r = await api.get(`/shops/${shopId}/products.json`, {
      params: { limit, page },
    });
    res.json(r.data);
  } catch (e) {
    res.status(500).json({ error: e?.response?.data ?? e.message });
  }
});

/**
 * 3) Bir product'ın detayını getir (variant_id bulmak için)
 */
app.get("/printify/products/:productId", async (req, res) => {
  try {
    const shopId = process.env.PRINTIFY_SHOP_ID;
    if (!shopId) return res.status(400).json({ error: "PRINTIFY_SHOP_ID missing" });

    const { productId } = req.params;
    const r = await api.get(`/shops/${shopId}/products/${productId}.json`);
    res.json(r.data);
  } catch (e) {
    res.status(500).json({ error: e?.response?.data ?? e.message });
  }
});

/**
 * 4) SİPARİŞ OLUŞTUR (asıl köprü)
 * Bu endpoint'i "ödeme başarılı" olduktan sonra çağır.
 *
 * Body örneği:
 * {
 *   "external_id":"ORDER-1001",
 *   "items":[{"product_id":"xxxx","variant_id":12345,"quantity":1}],
 *   "shipping_method":1,
 *   "address":{
 *     "first_name":"Onur","last_name":"Sel","email":"a@b.com",
 *     "country":"TR","address1":"...","city":"Istanbul","zip":"34000"
 *   }
 * }
 */
app.post("/checkout/printify", async (req, res) => {
  try {
    const shopId = process.env.PRINTIFY_SHOP_ID;
    if (!shopId) return res.status(400).json({ error: "PRINTIFY_SHOP_ID missing" });

    const { external_id, items, shipping_method, address } = req.body || {};

    if (!external_id) return res.status(400).json({ error: "external_id required" });
    if (!Array.isArray(items) || items.length === 0) return res.status(400).json({ error: "items required" });
    if (!address?.first_name || !address?.last_name || !address?.country || !address?.address1 || !address?.city || !address?.zip) {
      return res.status(400).json({ error: "address required (first_name,last_name,country,address1,city,zip)" });
    }

    // Printify order payload
    const payload = {
      external_id,
      line_items: items.map((it) => ({
        product_id: it.product_id,
        variant_id: Number(it.variant_id),
        quantity: Number(it.quantity ?? 1),
      })),
      shipping_method: shipping_method ?? 1,
      send_shipping_notification: true,
      address_to: {
        first_name: address.first_name,
        last_name: address.last_name,
        email: address.email,
        phone: address.phone,
        country: address.country,     // "TR" gibi
        region: address.region,       // opsiyonel
        address1: address.address1,
        address2: address.address2,
        city: address.city,
        zip: address.zip,
      },
    };

    // 1) Siparişi oluştur
    const created = await api.post(`/shops/${shopId}/orders.json`, payload);

    // Not: Bazı akışlarda "submit" ayrı endpoint olabilir. Eğer Printify "draft" oluşturuyorsa,
    // response içindeki ID ile submit endpoint'i dokümana göre eklenir.
    res.json({ ok: true, printify_order: created.data });
  } catch (e) {
    res.status(500).json({ error: e?.response?.data ?? e.message });
  }
});

/**
 * 5) Sipariş durumunu çek (müşteriye status göstermek için)
 */
app.get("/printify/orders/:orderId", async (req, res) => {
  try {
    const shopId = process.env.PRINTIFY_SHOP_ID;
    if (!shopId) return res.status(400).json({ error: "PRINTIFY_SHOP_ID missing" });

    const { orderId } = req.params;
    const r = await api.get(`/shops/${shopId}/orders/${orderId}.json`);
    res.json(r.data);
  } catch (e) {
    res.status(500).json({ error: e?.response?.data ?? e.message });
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log(`Server running on :${process.env.PORT || 3000}`);
});
