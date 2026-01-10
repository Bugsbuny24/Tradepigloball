import crypto from "crypto";

function hmacSHA256(data, key) {
  return crypto.createHmac("sha256", key).update(data).digest("base64");
}

// NOTE: Bu dosya “iskelet”. iyzico’nun beklediği request body alanları (buyer, shipping, billing vs)
// eksiksiz doldurulmalı. Senin için minimal akış: checkoutFormInitialize endpoint.
export default async function handler(req, res) {
  try {
    if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

    const apiKey = process.env.IYZICO_API_KEY;
    const secretKey = process.env.IYZICO_SECRET_KEY;
    const baseUrl = process.env.IYZICO_BASE_URL;
    const appUrl = process.env.APP_URL;

    if (!apiKey || !secretKey || !baseUrl || !appUrl) {
      return res.status(500).json({ error: "Missing iyzico env vars" });
    }

    const { cart, total } = req.body || {};
    if (!cart?.length) return res.status(400).json({ error: "Cart empty" });

    // Basit basket items
    const basketItems = cart.map((x, i) => ({
      id: String(x.id),
      name: x.title,
      category1: "Print",
      itemType: "PHYSICAL",
      price: String(x.priceTRY * x.qty),
    }));

    const conversationId = String(Date.now());

    const payload = {
      locale: "tr",
      conversationId,
      price: String(total),
      paidPrice: String(total),
      currency: "TRY",
      basketId: "B" + conversationId,
      paymentGroup: "PRODUCT",
      callbackUrl: `${appUrl}/api/iyzico/callback`,
      enabledInstallments: [1],

      buyer: {
        id: "BY789",
        name: "Onur",
        surname: "Sel",
        gsmNumber: "+905555555555",
        email: "onur@example.com",
        identityNumber: "11111111111",
        lastLoginDate: "2025-01-01 00:00:00",
        registrationDate: "2025-01-01 00:00:00",
        registrationAddress: "Istanbul",
        ip: req.headers["x-forwarded-for"]?.split(",")[0] || "85.34.78.112",
        city: "Istanbul",
        country: "Turkey",
        zipCode: "34000",
      },

      shippingAddress: {
        contactName: "Onur Sel",
        city: "Istanbul",
        country: "Turkey",
        address: "Adres",
        zipCode: "34000",
      },

      billingAddress: {
        contactName: "Onur Sel",
        city: "Istanbul",
        country: "Turkey",
        address: "Adres",
        zipCode: "34000",
      },

      basketItems,
    };

    // iyzico signature (Authorization) formatı endpoint’e göre değişir.
    // Bu iskelette direkt “checkoutform/initialize” çağırıyoruz.
    const uri = "/payment/iyzipos/checkoutform/initialize";
    const rnd = conversationId;

    const bodyString = JSON.stringify(payload);
    const hash = hmacSHA256(bodyString, secretKey);

    // Bu header formatı, iyzico dokümanında “IYZWSv2” şeklinde geçer.
    // Eğer sandbox hata verirse, direkt iyzico node sdk ile 1:1 yapacağız.
    const authString = `apiKey:${apiKey}&randomKey:${rnd}&signature:${hash}`;
    const authorization = "IYZWSv2 " + Buffer.from(authString).toString("base64");

    const r = await fetch(baseUrl + uri, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authorization,
        "x-iyzi-rnd": rnd,
      },
      body: bodyString,
    });

    const data = await r.json();
    if (!r.ok) return res.status(r.status).json({ error: "iyzico error", details: data });

    // iyzico burada checkoutFormContent döndürür (HTML)
    return res.status(200).json({ checkoutFormContent: data.checkoutFormContent });
  } catch (e) {
    return res.status(500).json({ error: e.message || "Server error" });
  }
  }
