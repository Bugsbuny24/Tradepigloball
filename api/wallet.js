import { supabaseUser } from "./_lib/supabase.js";

export default async function handler(req, res) {
  try {
    const supabase = supabaseUser(req);

    // credit_wallets RLS: user_id = auth.uid()
    const { data, error } = await supabase
      .from("credit_wallets")
      .select("balance, locked")
      .single();

    if (error) return res.status(401).json({ ok: false, error: error.message });

    return res.json({ ok: true, balance: data.balance, locked: data.locked });
  } catch (e) {
    return res.status(500).json({ ok: false, error: String(e?.message || e) });
  }
}
