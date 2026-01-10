import { createClient } from "@supabase/supabase-js";
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  const { referred_id } = req.body;

  const { data: ref } = await supabase
    .from("referrals")
    .select("*")
    .eq("referred_id", referred_id)
    .single();

  if (!ref) return res.json({ ok: false });

  const { data: reward } = await supabase
    .from("referral_rewards")
    .select("*")
    .eq("referred_id", referred_id)
    .single();

  if (reward?.rewarded) return res.json({ ok: true });

  // mint credits
  await supabase.rpc("mint_credit", {
    p_user_id: ref.referrer_id,
    p_amount: 20,
    p_reason: "referral_reward"
  });

  await supabase.rpc("mint_credit", {
    p_user_id: referred_id,
    p_amount: 10,
    p_reason: "referral_welcome"
  });

  await supabase.from("referral_rewards").insert({
    referred_id,
    rewarded: true
  });

  res.json({ ok: true });
}
