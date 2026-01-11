export default function FeatureBox({ rfqId }) {
  const feature = async (hours) => {
    await fetch("/api/rfqs-feature", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rfq_id: rfqId, hours })
    });
    alert("Öne çıkarıldı 🔥");
    window.location.reload();
  };

  return (
    <div style={{ marginTop: 20 }}>
      <h4>Öne Çıkar</h4>
      <button onClick={() => feature(24)}>24s · 10 Credit</button>
      <button onClick={() => feature(72)}>3g · 25 Credit</button>
      <button onClick={() => feature(168)}>7g · 50 Credit</button>
    </div>
  );
}
