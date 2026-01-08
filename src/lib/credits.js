import { supabase } from "./supabaseClient";

// Ana fonksiyon
export async function creditSpend(action, amount = 1, note = "") {
  const { data, error } = await supabase.rpc("rpc_credit_spend", {
    p_action: String(action),
    p_amount: Number(amount),
    p_note: String(note || ""),
  });

  if (error) {
    // Supabase error objesini daha okunur hale getir
    const e = new Error(error.message || "credit spend failed");
    e.code = error.code || error.message;
    throw e;
  }
  return data;
}

// ✅ Geriye uyumluluk: RFQDetail "spendCredit" import ediyorsa patlamasın
export const spendCredit = creditSpend;
