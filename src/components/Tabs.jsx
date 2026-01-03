export default function Tabs({ tabs, active, onChange }) {
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", margin: "12px 0" }}>
      {tabs.map((t) => (
        <button
          key={t}
          onClick={() => onChange(t)}
          style={{
            padding: "8px 10px",
            borderRadius: 10,
            border: "1px solid #ccc",
            background: active === t ? "#eee" : "white",
            cursor: "pointer",
          }}
        >
          {t}
        </button>
      ))}
    </div>
  );
}
