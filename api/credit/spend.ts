import { supabase } from "@/lib/supabase";

export async function spendCredit({
  user_id,
  amount,
  reason,
  ref_type,
  ref_id,
  idempotency_key
}) {
  const { data: wallet } = await supabase
    .from("credit_wallets")
    .select("balance")
    .eq("user_id", user_id)
    .single();

  if (!wallet || wallet.balance < amount) {
    throw new Error("INSUFFICIENT_CREDIT");
  }

  await supabase.rpc("credit_spend", {
    p_user_id: user_id,
    p_amount: amount,
    p_reason: reason,
    p_ref_type: ref_type,
    p_ref_id: ref_id,
    p_idempotency_key: idempotency_key
  });

  return { ok: true };
}
