export default function ShowroomTabs({ tab, setTab }) {
  const tabs = [
    { key: "products", label: "Pi Products" },
    { key: "companies", label: "Companies" },
    { key: "rfqs", label: "RFQs" },
  ];

  return (
    <div style={styles.wrap}>
      {tabs.map((t) => (
        <button
          key={t.key}
          onClick={() => setTab(t.key)}
          style={{
            ...styles.btn,
            ...(tab === t.key ? styles.btnActive : {}),
          }}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

const styles = {
  wrap: {
    display: "flex",
    gap: 8,
    padding: 10,
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 14,
    background: "rgba(10,10,30,0.6)",
    backdropFilter: "blur(8px)",
    overflowX: "auto",
  },
  btn: {
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "transparent",
    color: "white",
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
  btnActive: {
    background: "rgba(160, 80, 255, 0.22)",
    border: "1px solid rgba(160, 80, 255, 0.45)",
  },
};
