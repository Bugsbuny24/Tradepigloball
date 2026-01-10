import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser(req.headers.authorization);

  if (!user || authError) {
    return res.status(401).json({ error: "unauthorized" });
  }

  const { data: wallet } = await supabase
    .from("credit_wallets")
    .select("*")
    .eq("user_id", user.id)
    .single();

  const { data: ledger } = await supabase
    .from("credit_ledger")
    .select("id, amount, reason, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(10);

  res.json({ wallet, ledger });
}
