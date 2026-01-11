import { supabaseServer } from "../_lib/supabase";
import { requireAdmin } from "../_lib/adminGuard";

export default async function handler(req, res) {
  try {
    requireAdmin(req);
    const supabase = supabaseServer(req);
    const { action, payload } = req.body;

    switch (action) {
      case "toggle_feature":
        await supabase
          .from("feature_flags")
          .update({ enabled: payload.enabled })
          .eq("feature", payload.feature);
        break;

      case "maintenance":
        await supabase
          .from("app_settings")
          .update({ maintenance: payload.enabled });
        break;

      default:
        throw new Error("UNKNOWN_ACTION");
    }

    await supabase.from("audit_log").insert({
      actor_id: req.user.id,
      action,
      meta: payload,
    });

    res.json({ ok: true });
  } catch (e) {
    res.status(403).json({ error: e.message });
  }
              }
