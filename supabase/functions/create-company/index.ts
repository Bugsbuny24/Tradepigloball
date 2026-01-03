/// <reference path="../_shared/deno.d.ts" />

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

type CreateCompanyBody = {
  name: string;
  country?: string | null;
  city?: string | null;
  sector?: string | null;
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

function bad(message: string, status = 400, extra: Record<string, unknown> = {}) {
  return json({ ok: false, error: message, ...extra }, status);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return json({ ok: true }, 200);
  if (req.method !== "POST") return bad("Method not allowed", 405);

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") ?? "";

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !SUPABASE_ANON_KEY) {
    return bad("Missing server env (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY / SUPABASE_ANON_KEY)", 500);
  }

  const authHeader = req.headers.get("authorization") ?? "";
  if (!authHeader.toLowerCase().startsWith("bearer ")) {
    return bad("Missing Authorization Bearer token", 401);
  }

  let body: CreateCompanyBody;
  try {
    body = (await req.json()) as CreateCompanyBody;
  } catch {
    return bad("Invalid JSON body", 400);
  }

  const name = (body?.name ?? "").trim();
  const country = (body?.country ?? null);
  const city = (body?.city ?? null);
  const sector = (body?.sector ?? null);

  if (!name || name.length < 2) return bad("Company name is required", 400);

  // 1) Token doğrula (anon client + Authorization header)
  const supabaseAuth = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
  });

  const { data: userData, error: userErr } = await supabaseAuth.auth.getUser();
  if (userErr || !userData?.user) return bad("Unauthorized", 401);

  const uid = userData.user.id;

  // 2) Admin client (service_role) ile DB yaz
  const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  // 2A) Zaten şirketi var mı? (company_users unique index zaten kilitleyecek ama düzgün mesaj verelim)
  const { data: existingMember, error: existErr } = await admin
    .from("company_users")
    .select("company_id, role")
    .eq("user_id", uid)
    .maybeSingle();

  if (existErr) return bad("DB error while checking membership", 500, { details: existErr.message });
  if (existingMember?.company_id) {
    return bad("User already has a company", 409, {
      company_id: existingMember.company_id,
      role: existingMember.role,
    });
  }

  // 3) Company oluştur
  // companies.id BIGINT olduğu için returning id ile alacağız
  const { data: companyRows, error: companyErr } = await admin
    .from("companies")
    .insert({
      name,
      country,
      city,
      sector,
      status: "pending",
      created_by: uid,
    })
    .select("id, name, status, created_by, created_at")
    .limit(1);

  if (companyErr || !companyRows?.length) {
    // Unique constraint tetiklenirse burada da yakalanır (companies_created_by_uniq)
    return bad("Failed to create company", 500, { details: companyErr?.message ?? "unknown" });
  }

  const company = companyRows[0];

  // 4) Company owner membership ekle
  const { error: memberErr } = await admin.from("company_users").insert({
    company_id: company.id,
    user_id: uid,
    email: userData.user.email ?? "", // sende email var diye tutuyorsun; yoksa boş geçme, ama supabase auth genelde email verir
    role: "owner",
  });

  if (memberErr) {
    // Best-effort rollback
    await admin.from("companies").delete().eq("id", company.id);
    return bad("Failed to create company membership", 500, { details: memberErr.message });
  }

  return json({ ok: true, company });
});
