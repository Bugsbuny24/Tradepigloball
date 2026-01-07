import { supabase } from "./supabase";

export const CREDIT_COST = {
  RFQ_CREATE: 1,
  PRODUCT_CREATE: 1,
};

export async function walletMe() {
  // Auth kontrolü
  const { data: auth } = await supabase.auth.getUser();
  const uid = auth?.user?.id;
  if (!uid) throw Object.assign(new Error("NOT_AUTHENTICATED"), { code: "NOT_AUTHENTICATED" });

  // Wallet yoksa create (idempotent)
  // Not: user_wallets tablon RLS ile user kendi row’unu insert edebilmeli
  await supabase
    .from("user_wallets")
    .upsert({ user_id: uid, balance: 0 }, { onConflict: "user_id" });

  // Balance oku
  const { data, error } = await supabase
    .from("user_wallets")
    .select("balance")
    .eq("user_id", uid)
    .single();

  if (error) throw error;
  return data?.balance ?? 0;
}

export async function creditSpend(action, amount, note = "") {
  // RPC: public.rpc_credit_spend(text, integer, text)
  const { data, error } = await supabase.rpc("rpc_credit_spend", {
    p_action: action,
    p_amount: amount,
    p_note: note,
  });

  if (error) {
    // Supabase RPC hata mesajlarını normalize edelim
    const msg = (error?.message || "").toUpperCase();
    if (msg.includes("YETERSIZ") || msg.includes("INSUFFICIENT")) {
      throw Object.assign(new Error("YETERSIZ_KREDI"), { code: "YETERSIZ_KREDI" });
    }
    if (msg.includes("NOT_AUTHENTICATED")) {
      throw Object.assign(new Error("NOT_AUTHENTICATED"), { code: "NOT_AUTHENTICATED" });
    }
    throw error;
  }

  // data genelde yeni balance döner
  return data;
}
