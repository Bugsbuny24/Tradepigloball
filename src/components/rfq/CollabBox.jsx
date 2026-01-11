export default function CollabBox({ rfqId }) {
  const create = async () => {
    await fetch("/api/collab-create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rfq_id: rfqId })
    });
    alert("Collab açıldı 🤝");
  };

  return (
    <div style={{ marginTop: 20 }}>
      <button onClick={create}>
        Collab Başlat (15 Credit)
      </button>
    </div>
  );
}
