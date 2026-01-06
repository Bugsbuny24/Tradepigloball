export default function RfqCard({ r }) {
  return (
    <div style={styles.card}>
      <div style={styles.title}>{r.title}</div>
      <div style={styles.meta}>
        <span>{r.country || "—"}</span>
        <span>•</span>
        <span>Qty: {r.quantity ?? "—"}</span>
        <span>•</span>
        <span>Deadline: {r.deadline ?? "—"}</span>
      </div>
      <div style={styles.status}>Status: {r.status}</div>
    </div>
  );
}

const styles = {
  card: {
    borderRadius: 18,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(10,10,30,0.65)",
    padding: 12,
  },
  title: { fontWeight: 800, marginBottom: 6 },
  meta: { display: "flex", gap: 8, opacity: 0.85, fontSize: 13, flexWrap: "wrap" },
  status: { marginTop: 10, opacity: 0.8, fontSize: 13 },
};
