export function canSpend({ user, cost = 0 }) {
  if (!user) return false;
  return (user.credit ?? 0) >= cost;
}

export function spendCredit({ user, cost }) {
  if (!canSpend({ user, cost })) {
    throw new Error("Yetersiz kredi");
  }

  // burada ileride:
  // - supabase update
  // - transaction log
  return true;
}
