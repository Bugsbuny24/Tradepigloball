import { corsHeaders } from "../_shared/cors.ts";
import { getSupabaseAdmin } from "../_shared/supabase.ts";
import { verifyPiPayment } from "../_shared/pi.ts";

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

export default async function handler(req: Request) {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "METHOD_NOT_ALLOWED" }, 405);

  const supabase = getSupabaseAdmin();
  const authHeader = req.headers.get("Authorization") ?? "";
  const jwt = authHeader.replace("Bearer ", "");

  const { data: userData, error: userErr } = await supabase.auth.getUser(jwt);
  if (userErr || !userData?.user) return json({ error: "UNAUTHORIZED" }, 401);
  const buyerId = userData.user.id;

  const body = await req.json().catch(() => ({}));
  const productId = String(body.product_id ?? "");
  const piPaymentId = String(body.pi_payment_id ?? "");
  if (!productId) return json({ error: "PRODUCT_ID_REQUIRED" }, 400);
  if (!piPaymentId) return json({ error: "PI_PAYMENT_ID_REQUIRED" }, 400);

  // Load product
  const { data: product, error: pErr } = await supabase
    .from("digital_products")
    .select("id, owner_id, price_pi, status")
    .eq("id", productId)
    .single();

  if (pErr || !product) return json({ error: "PRODUCT_NOT_FOUND" }, 404);
  if (product.status !== "published") return json({ error: "PRODUCT_NOT_PUBLISHED" }, 400);
  if (product.owner_id === buyerId) return json({ error: "CANNOT_BUY_OWN_PRODUCT" }, 400);

  // Verify Pi payment (amount check'i pi.ts içinde yaparsın)
  const v = await verifyPiPayment(piPaymentId);
  if (!v.ok) return json({ error: "PI_VERIFY_FAILED", reason: v.reason }, 400);

  // Insert purchase
  const { data: purchase, error: insErr } = await supabase
    .from("digital_purchases")
    .insert({
      product_id: product.id,
      buyer_id: buyerId,
      seller_id: product.owner_id,
      price_pi: product.price_pi,
      pi_payment_id: piPaymentId,
      txid: v.txid ?? null,
      status: "paid",
    })
    .select("id")
    .single();

  if (insErr) return json({ error: "PURCHASE_CREATE_FAILED", details: insErr.message }, 400);

  return json({ ok: true, purchase_id: purchase.id, product_id: product.id });
}
