import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL;
const anon = process.env.SUPABASE_ANON_KEY;

if (!url || !anon) {
  console.warn("Missing SUPABASE_URL or SUPABASE_ANON_KEY");
}

export function supabaseAnon() {
  return createClient(url, anon, { auth: { persistSession: false } });
}

/**
 * Kullanıcı auth gerekiyorsa frontend "Authorization: Bearer <token>" gönderir.
 * Biz de supabase client'a header olarak taşırız.
 */
export function supabaseUser(req) {
  const token = (req.headers.authorization || "").replace("Bearer ", "").trim();
  return createClient(url, anon, {
    auth: { persistSession: false },
    global: {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    },
  });
}
