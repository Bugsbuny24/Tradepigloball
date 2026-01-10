import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import axios from 'axios';

const app = express();
app.use(cors());
app.use(express.json());

const PORT = Number(process.env.PORT || 8787);
const PRINTIFY_API_KEY = process.env.PRINTIFY_API_KEY;

if (!PRINTIFY_API_KEY) {
  console.error('❌ Missing PRINTIFY_API_KEY in backend/.env');
  process.exit(1);
}

const api = axios.create({
  baseURL: 'https://api.printify.com/v1',
  headers: {
    Authorization: `Bearer ${PRINTIFY_API_KEY}`,
    'Content-Type': 'application/json'
  },
  timeout: 20000
});

// Health
app.get('/health', (_req, res) => res.json({ ok: true }));

// 1) Shops (Shop ID buradan gelir)
app.get('/api/printify/shops', async (_req, res) => {
  try {
    const { data } = await api.get('/shops.json');
    res.json(data);
  } catch (err) {
    const status = err?.response?.status || 500;
    res.status(status).json({
      error: 'Failed to fetch shops',
      details: err?.response?.data || err.message
    });
  }
});

// Basit cache: ilk shop id (istersen değiştirirsin)
let cachedShopId = null;
async function getShopId() {
  if (cachedShopId) return cachedShopId;
  const { data } = await api.get('/shops.json');
  const first = Array.isArray(data) ? data[0] : null;
  if (!first?.id) throw new Error('No shop found in Printify. Did you create an API store?');
  cachedShopId = first.id;
  return cachedShopId;
}

// 2) Products list (senin sitede listelemek için)
app.get('/api/printify/products', async (_req, res) => {
  try {
    const shopId = await getShopId();
    const { data } = await api.get(`/shops/${shopId}/products.json`);
    // Printify response genelde { data: [...], current_page, last_page, ... }
    res.json({ shopId, ...data });
  } catch (err) {
    const status = err?.response?.status || 500;
    res.status(status).json({
      error: 'Failed to fetch products',
      details: err?.response?.data || err.message
    });
  }
});

// 3) Product detail (Variant ID'leri görmek için)
app.get('/api/printify/products/:productId', async (req, res) => {
  try {
    const shopId = await getShopId();
    const { productId } = req.params;
    const { data } = await api.get(`/shops/${shopId}/products/${productId}.json`);
    res.json({ shopId, ...data });
  } catch (err) {
    const status = err?.response?.status || 500;
    res.status(status).json({
      error: 'Failed to fetch product detail',
      details: err?.response?.data || err.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Backend running: http://localhost:${PORT}`);
  console.log(`- Health:   GET /health`);
  console.log(`- Shops:    GET /api/printify/shops`);
  console.log(`- Products: GET /api/printify/products`);
});
