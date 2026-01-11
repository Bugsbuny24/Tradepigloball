// api/credit/spend.ts
import { supabaseServer } from "../_lib/supabase.js";

export async function spendCredit(req: any, {
  user_id,
  amount,
  reason,
  ref_type,
  ref_id,
  idempotency_key,
}: any) {
  const supabase = supabaseServer(req);

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
    p_idempotency_key: idempotency_key,
  });

  return { ok: true };
}
