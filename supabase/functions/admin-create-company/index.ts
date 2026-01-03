/// <reference path="../_shared/deno.d.ts" />

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

type Body = {
  user_id: string;
  email: string;
  company: {
    name: string;
    country?: string | null;
    city?: string | null;
    sector?: string | null;
  };
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "access-control-allow-origin": "*",
      "access-control-allow-headers": "authorization, x-client-info, apikey, content-type",
      "access-control-allow-methods": "POST, OPTIONS",
    },
  });
}

function bad(msg: string, status = 400, extra: Record<string, unknown> = {}) {
  return json({ ok: false, error: msg, ...extra }, status);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return json({ ok: true });
  if (req.method !== "POST") return bad("Method not allowed", 405);

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
  const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

  // Basit admin koruması: kendi belirlediğin secret header
  const ADMIN_SECRET = Deno.env.get("ADMIN_SECRET") ?? "";
  const incomingSecret = req.headers.get("x-admin-secret") ?? "";

  if (!SUPABASE_URL || !SERVICE_ROLE || !ADMIN_SECRET) {
    return bad("Missing server env", 500);
  }
  if (incomingSecret !== ADMIN_SECRET) {
    return bad("Forbidden", 403);
  }

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return bad("Invalid JSON", 400);
  }

  const user_id = (body.user_id || "").trim();
  const email = (body.email || "").trim();
  const name = (body.company?.name || "").trim();

  if (!user_id) return bad("user_id required", 400);
  if (!email) return bad("email required", 400);
  if (!name) return bad("company.name required", 400);

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

  // 1) Zaten şirket var mı? (tek user tek company kilidin var)
  const { data: existingCompany, error: exErr } = await admin
    .from("companies")
    .select("id,name,status,created_by")
    .eq("created_by", user_id)
    .maybeSingle();

  if (exErr) return bad("DB error (check existing company)", 500, { details: exErr.message });

  if (existingCompany?.id) {
    // company_users owner kaydı yoksa tamamla
    const { data: existingMember } = await admin
      .from("company_users")
      .select("id,role")
      .eq("user_id", user_id)
      .maybeSingle();

    if (!existingMember?.id) {
      const { error: memErr } = await admin.from("company_users").insert({
        company_id: existingCompany.id,
        user_id,
        email,
        role: "owner",
      });
      if (memErr) return bad("Failed to create owner membership", 500, { details: memErr.message });
    }

    return json({ ok: true, company: existingCompany, created: false });
  }

  // 2) Şirket oluştur (status pending)
  const { data: rows, error: insErr } = await admin
    .from("companies")
    .insert({
      name,
      country: body.company.country ?? null,
      city: body.company.city ?? null,
      sector: body.company.sector ?? null,
      status: "pending",
      created_by: user_id,
    })
    .select("id,name,status,created_by,created_at")
    .limit(1);

  if (insErr || !rows?.length) {
    return bad("Failed to create company", 500, { details: insErr?.message ?? "unknown" });
  }

  const company = rows[0];

  // 3) Owner membership oluştur
  const { error: memErr } = await admin.from("company_users").insert({
    company_id: company.id,
    user_id,
    email,
    role: "owner",
  });

  if (memErr) {
    // rollback
    await admin.from("companies").delete().eq("id", company.id);
    return bad("Failed to create owner membership", 500, { details: memErr.message });
  }

  return json({ ok: true, company, created: true });
});
