import { useEffect, useState } from "react";

export default function Wallet() {
  const [wallet, setWallet] = useState(null);
  const [ledger, setLedger] = useState([]);

  useEffect(() => {
    fetch("/api/wallet")
      .then(r => r.json())
      .then(d => {
        setWallet(d.wallet);
        setLedger(d.ledger);
      });
  }, []);

  if (!wallet) return <div>Yükleniyor…</div>;

  return (
    <div style={{ padding: 20 }}>
      <h1>Wallet</h1>

      <div style={{ marginBottom: 20 }}>
        <h2>{wallet.balance} Credit</h2>
        {wallet.locked > 0 && (
          <small>Kilitli: {wallet.locked} Credit</small>
        )}
      </div>

      <button onClick={() => alert("Credit satın alma yakında")}>
        Credit Al
      </button>

      <h3 style={{ marginTop: 30 }}>Son İşlemler</h3>
      <ul>
        {ledger.map(l => (
          <li key={l.id}>
            <strong>{l.amount > 0 ? "+" : ""}{l.amount}</strong>{" "}
            – {l.reason}
          </li>
        ))}
      </ul>
    </div>
  );
}
function ReferralBox({ userId }) {
  const link = `${window.location.origin}/?ref=${userId}`;
  return (
    <div>
      <h4>Davet Et</h4>
      <input value={link} readOnly />
      <small>Arkadaşın ilk 10 Credit harcarsa kazanırsın</small>
    </div>
  );
}
