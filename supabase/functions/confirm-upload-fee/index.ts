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
  const userId = userData.user.id;

  const body = await req.json().catch(() => ({}));
  const productId = String(body.product_id ?? "");
  const piPaymentId = String(body.pi_payment_id ?? "");

  if (!productId) return json({ error: "PRODUCT_ID_REQUIRED" }, 400);
  if (!piPaymentId) return json({ error: "PI_PAYMENT_ID_REQUIRED" }, 400);

  // Verify Pi payment (2 PI)
  const v = await verifyPiPayment(piPaymentId);
  if (!v.ok) return json({ error: "PI_VERIFY_FAILED", reason: v.reason }, 400);

  // Mark upload session paid (only own session)
  const { error: upErr } = await supabase
    .from("upload_sessions")
    .update({ paid: true })
    .eq("user_id", userId)
    .eq("product_id", productId);

  if (upErr) return json({ error: "UPLOAD_SESSION_UPDATE_FAILED", details: upErr.message }, 400);

  return json({ ok: true, product_id: productId });
}
