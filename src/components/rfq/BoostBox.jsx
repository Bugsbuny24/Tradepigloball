export default function BoostBox({ rfqId }) {
  const boost = async (hours) => {
    try {
      await fetch("/api/rfqs-boost", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rfq_id: rfqId, hours })
      });
      alert(`Boost aktif 🚀 (${hours} saat)`);
    } catch {
      alert("Boost sistemi yakında 🚧");
    }
  };

  return (
    <div style={{ marginTop: 20 }}>
      <h4>🚀 Boost</h4>
      <button onClick={() => boost(6)}>6s · 5 Credit</button>
      <button onClick={() => boost(24)}>24s · 15 Credit</button>
      <button onClick={() => boost(72)}>3g · 30 Credit</button>
    </div>
  );
}
