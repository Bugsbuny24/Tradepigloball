export default function LocalProducerBox({ rfqId }) {
  const open = async () => {
    try {
      await fetch("/api/local-producer-open", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rfq_id: rfqId })
      });
      alert("Local Producer modu açıldı 🏭");
    } catch {
      alert("Yakında aktif 🚧");
    }
  };

  return (
    <div style={{ marginTop: 20 }}>
      <h4>🏭 Yerel Üretici</h4>
      <p>Atölye / küçük üretici eşleşmesi</p>
      <button onClick={open}>Local Producer Aç (15 Credit)</button>
    </div>
  );
}
