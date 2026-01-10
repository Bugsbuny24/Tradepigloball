const PACKAGES = [
  { id: "starter", pi: 10, credit: 100 },
  { id: "creator", pi: 50, credit: 600 },
  { id: "pro", pi: 100, credit: 1300 },
  { id: "boost", pi: 200, credit: 3000 }
];

export default function BuyCredit() {
  const buy = async (pkg) => {
    // Pi Browser SDK (placeholder)
    if (!window.Pi) {
      alert("Pi Browser gerekli");
      return;
    }

    const payment = await window.Pi.createPayment({
      amount: pkg.pi,
      memo: `Credit package: ${pkg.id}`,
      metadata: { package: pkg.id }
    });

    await fetch("/api/credit-mint", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        pi_payment_id: payment.identifier,
        package: pkg.id
      })
    });

    alert("Credit yüklendi 🔥");
    window.location.reload();
  };

  return (
    <div>
      <h3>Credit Al</h3>
      {PACKAGES.map(p => (
        <button key={p.id} onClick={()=>buy(p)}>
          {p.pi} Pi → {p.credit} Credit
        </button>
      ))}
    </div>
  );
}
