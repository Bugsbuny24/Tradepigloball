// SADECE SERVICE ROLE + RPC
await supabase.rpc("mint_credit", {
  p_user_id: userId,
  p_amount: credit,
  p_reason: `credit_purchase_${pkg}`,
  p_idempotency_key: pi_payment_id
});
