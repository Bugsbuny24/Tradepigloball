export default async function handler(req, res) {
  // 🔐 GOD MODE GUARD — EN ÜSTTE
  const GOD_EMAILS = process.env.GOD_EMAILS?.split(",") ?? [];

  if (!req.user || !GOD_EMAILS.includes(req.user.email)) {
    return res.status(403).json({ error: "GOD MODE ONLY" });
  }

  try {
    const action = req.body;

    validateDBAction(action);

    let sql = "";

    if (action.type === "create_table") {
      const cols = Object.entries(action.columns)
        .map(([k, v]) => `${k} ${v}`)
        .join(",");
      sql = `create table if not exists ${action.table} (${cols});`;
    }

    if (action.type === "add_column") {
      sql = `alter table ${action.table} add column ${action.column} ${action.data_type};`;
    }

    await supabase.rpc("execute_sql", { sql });

    await supabase.from("audit_log").insert({
      action: "GOD_DB_" + action.type,
      meta: action,
    });

    res.json({ ok: true });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
}
