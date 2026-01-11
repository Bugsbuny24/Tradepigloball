import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  const { enabled } = req.body;

  await supabase
    .from("app_settings")
    .upsert({ key: "maintenance_mode", value: String(enabled) });

  await supabase.from("audit_log").insert({
    action: "GOD_MAINTENANCE",
    meta: { enabled }
  });

  res.json({ ok: true });
}
