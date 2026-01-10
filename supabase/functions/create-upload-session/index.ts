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

  const authHeader = req.headers.get("Authorization") ?? "";
  const supabase = getSupabaseAdmin();

  // Caller user id (JWT) — edge’de “authenticated user”ı böyle alıyoruz
  const jwt = authHeader.replace("Bearer ", "");
  const { data: userData, error: userErr } = await supabase.auth.getUser(jwt);
  if (userErr || !userData?.user) return json({ error: "UNAUTHORIZED" }, 401);
  const userId = userData.user.id;

  const body = await req.json().catch(() => ({}));
  const title = String(body.title ?? "").trim();
  const description = String(body.description ?? "").trim();
  const pricePi = Number(body.price_pi);

  if (!title) return json({ error: "TITLE_REQUIRED" }, 400);
  if (!Number.isFinite(pricePi) || pricePi <= 0) return json({ error: "PRICE_PI_INVALID" }, 400);

  // 1) create draft product
  const { data: product, error: pErr } = await supabase
    .from("digital_products")
    .insert({
      owner_id: userId,
      title,
      description,
      price_pi: pricePi,
      status: "draft",
      file_path: null,
    })
    .select("id")
    .single();

  if (pErr) return json({ error: "PRODUCT_CREATE_FAILED", details: pErr.message }, 400);

  // 2) create upload session (paid=false)
  const { error: sErr } = await supabase
    .from("upload_sessions")
    .insert({
      user_id: userId,
      product_id: product.id,
      paid: false,
      // expires_at default 30 min
    });

  if (sErr) return json({ error: "UPLOAD_SESSION_FAILED", details: sErr.message }, 400);

  // Client upload path: `${uid}/${product_id}/${filename}`
  return json({
    product_id: product.id,
    upload_path_prefix: `${userId}/${product.id}/`,
    upload_fee_pi: 2,
  });
}
