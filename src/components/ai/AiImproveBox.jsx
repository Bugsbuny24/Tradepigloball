export default function AiImproveBox({ field = "title" }) {
  const run = async () => {
    try {
      await fetch("/api/ai-improve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ field })
      });
      alert("AI iyileştirme yapıldı ✨");
    } catch {
      alert("AI yakında aktif 🤖");
    }
  };

  return (
    <div style={{ marginTop: 20 }}>
      <button onClick={run}>
        ✨ AI ile {field === "title" ? "Başlık" : "Açıklama"} İyileştir (5 Credit)
      </button>
    </div>
  );
}
