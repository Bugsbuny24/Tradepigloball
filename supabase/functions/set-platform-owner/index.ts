import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const { user_id } = await req.json();

  if (!user_id) {
    return new Response("user_id required", { status: 400 });
  }

  const { error } = await supabaseAdmin.auth.admin.updateUserById(
    user_id,
    {
      app_metadata: {
        is_platform_owner: true
      }
    }
  );

  if (error) {
    return new Response(JSON.stringify(error), { status: 500 });
  }

  return new Response(
    JSON.stringify({ success: true, user_id }),
    { headers: { "Content-Type": "application/json" } }
  );
});
