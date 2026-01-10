import { supabaseAnon } from "./_lib/supabase.js";

export default async function handler(req, res) {
  try {
    const supabase = supabaseAnon();
    const { mode = "all", sort = "trend" } = req.query || {};

    let q = supabase
      .from("rfqs")
      .select("id, title, description, mode, status, min_credit, current_credit, is_featured, is_trending, created_at")
      .in("status", ["open", "threshold_reached", "production_ready"])
      .limit(50);

    if (mode !== "all") q = q.eq("mode", mode);

    // trend: featured/trending/credit > new: created_at
    if (sort === "new") q = q.order("created_at", { ascending: false });
    else q = q.order("current_credit", { ascending: false }).order("created_at", { ascending: false });

    const { data, error } = await q;
    if (error) return res.status(400).json({ ok: false, error: error.message });

    return res.json({ ok: true, items: data || [] });
  } catch (e) {
    return res.status(500).json({ ok: false, error: String(e?.message || e) });
  }
}
