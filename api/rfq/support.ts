// api/rfq/support.ts
import { supabaseServer } from "../_lib/supabase.js";
import { spendCredit } from "../credit/spend.js";

export async function rfqSupport(req: any, {
  user_id,
  rfq_id,
}: any) {
  const supabase = supabaseServer(req);

  await spendCredit(req, {
    user_id,
    amount: 5,
    reason: "rfq_support",
    ref_type: "rfq",
    ref_id: rfq_id,
    idempotency_key: `rfq_support_${rfq_id}`,
  });

  await supabase
    .from("rfqs")
    .update({ supported: true })
    .eq("id", rfq_id);

  return { ok: true };
}
