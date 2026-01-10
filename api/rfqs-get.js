import { supabaseAnon } from "./_lib/supabase.js";

export default async function handler(req, res) {
  try {
    const supabase = supabaseAnon();
    const { id } = req.query || {};
    if (!id) return res.status(400).json({ ok: false, error: "Missing id" });

    const { data, error } = await supabase
      .from("rfqs")
      .select("*")
      .eq("id", id)
      .single();

    if (error) return res.status(404).json({ ok: false, error: error.message });

    return res.json({ ok: true, item: data });
  } catch (e) {
    return res.status(500).json({ ok: false, error: String(e?.message || e) });
  }
}
