import { corsHeaders } from "../_shared/cors.ts";
import { getSupabaseAdmin } from "../_shared/supabase.ts";

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
  if (!productId) return json({ error: "PRODUCT_ID_REQUIRED" }, 400);

  // Check purchase
  const { data: purchase, error: purErr } = await supabase
    .from("digital_purchases")
    .select("id, status")
    .eq("product_id", productId)
    .eq("buyer_id", buyerId)
    .eq("status", "paid")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (purErr) return json({ error: "PURCHASE_LOOKUP_FAILED", details: purErr.message }, 400);
  if (!purchase) return json({ error: "NOT_PURCHASED" }, 403);

  // Load file_path
  const { data: product, error: pErr } = await supabase
    .from("digital_products")
    .select("file_path")
    .eq("id", productId)
    .single();

  if (pErr || !product?.file_path) return json({ error: "FILE_NOT_READY" }, 400);

  // Signed URL (1 saat)
  const { data: signed, error: sErr } = await supabase.storage
    .from("digital-products")
    .createSignedUrl(product.file_path, 60 * 60);

  if (sErr) return json({ error: "SIGNED_URL_FAILED", details: sErr.message }, 400);

  return json({ ok: true, url: signed.signedUrl });
         }
