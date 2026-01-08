// src/lib/credits.js
import { supabase } from "./supabaseClient";

/**
 * Kullanıcının kredisini düşer (RPC)
 * action örn: 'RFQ_CREATE', 'RFQ_OFFER'
 */
export async function spendCredit(action, amount = 1, note = "") {
  const { data, error } = await supabase.rpc("credit_spend", {
    p_action: action,
    p_amount: amount,
    p_note: note,
  });

  if (error) {
    console.error("spendCredit error:", error);
    throw error;
  }

  return data;
}

/**
 * Kullanıcının toplam kredisini getirir
 */
export async function getCredits(userId) {
  const { data, error } = await supabase
    .from("credit_ledger")
    .select("amount")
    .eq("user_id", userId);

  if (error) {
    console.error("getCredits error:", error);
    throw error;
  }

  return (data || []).reduce((sum, r) => sum + Number(r.amount || 0), 0);
}
