export default function VoteBox({ rfqId }) {
  const vote = async () => {
    try {
      await fetch("/api/rfqs-vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rfq_id: rfqId })
      });
      alert("Oy verdin 🗳 (5 Credit)");
    } catch {
      alert("Vote sistemi yakında aktif 🚧");
    }
  };

  return (
    <div style={{ marginTop: 20 }}>
      <button onClick={vote}>🗳 Oy Ver (5 Credit)</button>
    </div>
  );
}
