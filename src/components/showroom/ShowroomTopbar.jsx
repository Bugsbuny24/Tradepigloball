import { useNavigate } from "react-router-dom";

export default function ShowroomTopbar({ q, setQ, onOpenFilters }) {
  const nav = useNavigate();

  return (
    <div style={styles.wrap}>
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search products / companies / RFQs..."
        style={styles.input}
      />

      <button onClick={onOpenFilters} style={styles.secondary}>
        Filter
      </button>

      <button onClick={() => nav("/pi/rfq/create")} style={styles.primary}>
        + Create RFQ
      </button>
    </div>
  );
}

const styles = {
  wrap: { display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" },
  input: {
    flex: "1 1 240px",
    padding: "12px 12px",
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(0,0,0,0.25)",
    color: "white",
    outline: "none",
  },
  primary: {
    padding: "12px 14px",
    borderRadius: 14,
    border: "1px solid rgba(160,80,255,0.55)",
    background: "rgba(160,80,255,0.25)",
    color: "white",
    cursor: "pointer",
  },
  secondary: {
    padding: "12px 14px",
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.18)",
    background: "transparent",
    color: "white",
    cursor: "pointer",
  },
};
