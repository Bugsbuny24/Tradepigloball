import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const PACKAGES = {
  starter: { credit: 100 },
  creator: { credit: 600 },
  pro: { credit: 1300 },
  boost: { credit: 3000 }
};

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { pi_payment_id, package: pkg } = req.body;
  const credit = PACKAGES[pkg]?.credit;
  if (!credit) return res.status(400).json({ error: "invalid package" });

  // ⚠️ Pi payment doğrulama burada yapılır (MVP’de mock)
  const userId = req.headers["x-user-id"]; // auth middleware varsayımı

  // Wallet update
  await supabase
    .from("credit_wallets")
    .upsert({ user_id: userId, balance: credit }, { onConflict: "user_id" });

  // Ledger
  await supabase.from("credit_ledger").insert({
    user_id: userId,
    type: "mint",
    amount: credit,
    reason: `credit_purchase_${pkg}`,
    idempotency_key: pi_payment_id
  });

  res.json({ ok: true });
}
