import { supabase } from "./supabaseClient";

/**
 * Her şey "balance" üzerinden.
 * DB: public.user_wallets (user_id, balance)
 * RPC:
 *  - rpc_wallet_me() -> integer (balance)
 *  - rpc_credit_spend(p_action, p_amount, p_note) -> integer (new balance)
 */

export const CREDIT_COST = {
  RFQ_CREATE: 1,
  PRODUCT_CREATE: 1,
};

export async function creditEnsure() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const err = new Error("NOT_AUTHENTICATED");
    err.code = "NOT_AUTHENTICATED";
    throw err;
  }

  // RLS ile insert allowed (user_id = auth.uid()) olmalı
  await supabase
    .from("user_wallets")
    .upsert({ user_id: user.id, balance: 0 }, { onConflict: "user_id" });

  return user;
}

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

export async function creditSpend(action, amount, note = "") {
  // credit düşmeden RFQ/Product açılmayacak -> önce spend
  const { data, error } = await supabase.rpc("rpc_credit_spend", {
    p_action: action,
    p_amount: amount,
    p_note: note,
  });

  if (error) {
    // frontend'de kolay yakalamak için code bas
    const e = new Error(error.message);
    e.code = error.message; // örn: YETERSIZ_KREDI / NOT_AUTHENTICATED
    throw e;
  }

  // rpc integer döndürüyor: new balance
  return data ?? 0;
}
