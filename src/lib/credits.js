import { supabase } from "./supabaseClient";

// Toplam krediyi ledger’dan hesapla
export async function getCredits() {
  const {
    data: { user },
    error: uerr,
  } = await supabase.auth.getUser();

  if (uerr) throw uerr;
  if (!user) return 0;

  const { data, error } = await supabase
    .from("credit_ledger")
    .select("amount")
    .eq("user_id", user.id);

  if (error) throw error;

  return (data || []).reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
}

// 1 kredi düş (veya action_costs tablosuna göre düş)
// Not: DB’de rpc_credit_spend fonksiyonun var gibi. Onu çağırıyoruz.
export async function spendCredit(action = "GENERIC", amount = 1, note = "") {
  const { data, error } = await supabase.rpc("rpc_credit_spend", {
    p_action: action,
    p_amount: amount,
    p_note: note,
  });

  if (error) throw error;
  return data;
}
