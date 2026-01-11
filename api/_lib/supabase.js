// api/_lib/supabase.js
import { createClient } from "@supabase/supabase-js";

export function supabaseServer(req) {
  return createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      global: {
        headers: {
          Authorization: req?.headers?.authorization || "",
        },
      },
    }
  );
}
