import { supabase } from "./supabaseClient";

/**
 * SINGLE SOURCE OF TRUTH
 * public.user_wallets (user_id, balance)
 */

export const CREDIT_COST = {
  RFQ_CREATE: 1,
  PRODUCT_CREATE: 1,
};

/**
 * Kullanıcı var mı + wallet var mı?
 * VARSA → dokunma
 * YOKSA → balance=0 ile oluştur
 */
export async function creditEnsure() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const err = new Error("NOT_AUTHENTICATED");
    err.code = "NOT_AUTHENTICATED";
    throw err;
  }

  // 🔥 KRİTİK DÜZELTME BURASI
  await supabase
    .from("user_wallets")
    .insert({ user_id: user.id, balance: 0 })
    .onConflict("user_id")
    .ignore(); // ⛔ overwrite YOK

  return user;
}

/**
 * Kredi OKUMA — SADECE buradan
 */
export async function creditMe() {
  const user = await creditEnsure();

  const { data, error } = await supabase
    .from("user_wallets")
    .select("balance")
    .eq("user_id", user.id)
    .single();

  if (error) throw error;
  return data?.balance ?? 0;
}

/**
 * Kredi DÜŞME — SADECE rpc
 */
export async function creditSpend(action, amount, note = "") {
  const { data, error } = await supabase.rpc("rpc_credit_spend", {
    p_action: action,
    p_amount: amount,
    p_note: note,
  });

  if (error) {
    const e = new Error(error.message);
    e.code = error.message; // YETERSIZ_KREDI | NOT_AUTHENTICATED
    throw e;
  }

  // rpc yeni balance döndürür
  return data ?? 0;
}
