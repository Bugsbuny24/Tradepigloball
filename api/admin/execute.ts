import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req, res) {
  // 🔐 ADMIN GUARD
  if (!req.user || !req.user.is_app_admin) {
    return res.status(403).json({ error: "FORBIDDEN" });
  }

  const { action } = req.body;

  if (!action || !action.type) {
    return res.status(400).json({ error: "INVALID_ACTION" });
  }

  try {
    switch (action.type) {
      case "feature_cost":
        await supabase
          .from("feature_flags")
          .update({ cost: action.value })
          .eq("feature", action.feature);
        break;

      case "maintenance":
        await supabase
          .from("app_settings")
          .update({ maintenance: action.enabled });
        break;

      default:
        return res.status(400).json({ error: "UNKNOWN_ACTION" });
    }

    // 🧾 AUDIT LOG
    await supabase.from("audit_log").insert({
      actor_id: req.user.id,
      action: `ADMIN_${action.type}`,
      meta: action
    });

    return res.json({ ok: true });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
