if (!req.user || !req.user.is_app_admin) {
  return res.status(403).json({ error: "FORBIDDEN" });
}
export default async function handler(req, res) {
  const { action } = req.body;

  if (!req.user.is_app_admin) {
    return res.status(403).json({ error: "FORBIDDEN" });
  }

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
  }

  await supabase.from("audit_log").insert({
    actor_id: req.user.id,
    action: JSON.stringify(action)
  });

  res.json({ ok: true });
}
