import { supabase } from "./supabase";

/** action fiyatları (istediğin gibi değiştir) */
export const CREDIT_COST = {
  RFQ_CREATE: 3,
  PRODUCT_CREATE: 2,
  PRODUCT_BOOST: 5,
};

export async function creditEnsure() {
  const { error } = await supabase.rpc("rpc_credit_ensure");
  if (error) throw error;
}

export async function creditMe() {
  const { data, error } = await supabase.rpc("rpc_credit_me");
  if (error) throw error;
  return data ?? 0;
}

export async function creditSpend(action, amount, note = null) {
  const { data, error } = await supabase.rpc("rpc_credit_spend", {
    p_action: action,
    p_amount: amount,
    p_note: note,
  });

  if (error) {
    // backend'den NOT_ENOUGH_CREDITS gelirse yakalayalım
    const msg = String(error.message || "");
    if (msg.includes("NOT_ENOUGH_CREDITS")) {
      const e = new Error("YETERSIZ_KREDI");
      e.code = "YETERSIZ_KREDI";
      throw e;
    }
    throw error;
  }

  return data; // new balance
}
