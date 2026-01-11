export async function burnCredit(userId, amount, feature) {
  await supabase.from("credit_ledger").insert({
    user_id: userId,
    amount: -amount,
    feature,
    action: "burn"
  });
}
