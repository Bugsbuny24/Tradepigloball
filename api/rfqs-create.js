import { supabaseUser } from "./_lib/supabase.js";

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") return res.status(405).json({ ok: false, error: "Method not allowed" });

    const { title, description = "", minCredit = 50, mode = "rfq", tags = [] } = req.body || {};
    if (!title?.trim()) return res.status(400).json({ ok: false, error: "Missing title" });

    const supabase = supabaseUser(req);

    const { data, error } = await supabase
      .from("rfqs")
      .insert({
        title: title.trim(),
        description,
        mode,
        status: "open",
        min_credit: Number(minCredit) || 0,
        tags,
        // creator_id RLS ile auth.uid() bekliyorsa insert policy ile set edilmeli.
        // Eğer DB creator_id zorunluysa ve default yoksa, DB tarafında trigger/RPC gerekir.
      })
      .select("id")
      .single();

    if (error) return res.status(400).json({ ok: false, error: error.message });

    return res.json({ ok: true, id: data.id });
  } catch (e) {
    return res.status(500).json({ ok: false, error: String(e?.message || e) });
  }
}
