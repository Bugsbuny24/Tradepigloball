/// <reference path="../_shared/deno.d.ts" />

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "access-control-allow-origin": "*",
      "access-control-allow-headers": "authorization, x-client-info, apikey, content-type",
      "access-control-allow-methods": "POST, GET, OPTIONS",
    },
  });
}

function bad(message: string, status = 400, extra: Record<string, unknown> = {}) {
  return json({ ok: false, error: message, ...extra }, status);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return json({ ok: true }, 200);
  if (req.method !== "GET" && req.method !== "POST") return bad("Method not allowed", 405);

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

  // 1) Token doğrula (anon client + Authorization header)
  const supabaseAuth = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
  });

  const { data: userData, error: userErr } = await supabaseAuth.auth.getUser();
  if (userErr || !userData?.user) return bad("Unauthorized", 401);

  const uid = userData.user.id;

  // 2) Admin client (service_role) ile membership + company çek
  const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  // Tek kullanıcı tek şirket -> maybeSingle mantıklı
  const { data: membership, error: memErr } = await admin
    .from("company_users")
    .select("company_id, role, email, created_at")
    .eq("user_id", uid)
    .maybeSingle();

  if (memErr) return bad("DB error while reading membership", 500, { details: memErr.message });

  // Üyeliği yoksa: şirket yok demektir
  if (!membership?.company_id) {
    return json({
      ok: true,
      has_company: false,
      company: null,
      membership: null,
    });
  }

  // Company kaydını çek
  const { data: company, error: cErr } = await admin
    .from("companies")
    .select("id, name, country, city, sector, status, created_at, created_by")
    .eq("id", membership.company_id)
    .maybeSingle();

  if (cErr) return bad("DB error while reading company", 500, { details: cErr.message });

  return json({
    ok: true,
    has_company: true,
    company,
    membership: {
      role: membership.role,
      email: membership.email,
      company_id: membership.company_id,
      created_at: membership.created_at,
    },
  });
});
