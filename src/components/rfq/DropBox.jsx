export default function DropBox({ rfq }) {
  const join = async () => {
    await fetch("/api/drop-join", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rfq_id: rfq.id })
    });
    alert("Drop’a katıldın ⏱");
  };

  const ends = new Date(rfq.drop_ends_at);

  return (
    <div style={{ marginTop: 20 }}>
      <p>Bitiyor: {ends.toLocaleString()}</p>
      <button onClick={join}>Katıl (5 Credit)</button>
    </div>
  );
}
