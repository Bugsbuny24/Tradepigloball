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
  const userId = userData.user.id;

  const body = await req.json().catch(() => ({}));
  const productId = String(body.product_id ?? "");
  const filePath = String(body.file_path ?? "").trim();

  if (!productId) return json({ error: "PRODUCT_ID_REQUIRED" }, 400);
  if (!filePath) return json({ error: "FILE_PATH_REQUIRED" }, 400);

  // file_path format: `${uid}/${productId}/...`
  const parts = filePath.split("/");
  if (parts.length < 3) return json({ error: "FILE_PATH_INVALID" }, 400);
  if (parts[0] !== userId || parts[1] !== productId) return json({ error: "FILE_PATH_NOT_OWNED" }, 403);

  const { error: upErr } = await supabase
    .from("digital_products")
    .update({ file_path: filePath, status: "published" })
    .eq("id", productId)
    .eq("owner_id", userId);

  if (upErr) return json({ error: "PUBLISH_FAILED", details: upErr.message }, 400);

  return json({ ok: true, product_id: productId });
}
