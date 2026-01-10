export default function handler(req, res) {
  return res.json({
    ok: true,
    items: [
      { key: "starter", title: "Starter", pi_amount: 10, credit_amount: 100, bonus_credit: 0 },
      { key: "creator", title: "Creator", pi_amount: 50, credit_amount: 500, bonus_credit: 100 },
      { key: "pro", title: "Pro Creator", pi_amount: 100, credit_amount: 1200, bonus_credit: 100 },
      { key: "boost", title: "Community Boost", pi_amount: 200, credit_amount: 2800, bonus_credit: 200 }
    ],
    rate_note: "1 Pi = 10 Credit (oran sabit değildir)"
  });
}
