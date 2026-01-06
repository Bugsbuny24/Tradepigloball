export default function FiltersModal({ open, onClose, filters, setFilters, tab }) {
  if (!open) return null;

  const isProducts = tab === "products";
  const isCompanies = tab === "companies";
  const isRfqs = tab === "rfqs";

  return (
    <div style={styles.backdrop} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.head}>
          <div style={{ fontWeight: 700 }}>Filters</div>
          <button onClick={onClose} style={styles.x}>✕</button>
        </div>

        <label style={styles.label}>Country</label>
        <input
          value={filters.country}
          onChange={(e) => setFilters((p) => ({ ...p, country: e.target.value }))}
          placeholder="e.g. TR"
          style={styles.input}
        />

        {isProducts && (
          <label style={styles.row}>
            <input
              type="checkbox"
              checked={filters.featuredOnly}
              onChange={(e) => setFilters((p) => ({ ...p, featuredOnly: e.target.checked }))}
            />
            <span>Featured only</span>
          </label>
        )}

        {isCompanies && (
          <label style={styles.row}>
            <input
              type="checkbox"
              checked={filters.verifiedOnly}
              onChange={(e) => setFilters((p) => ({ ...p, verifiedOnly: e.target.checked }))}
            />
            <span>Verified only</span>
          </label>
        )}

        {isRfqs && (
          <label style={styles.row}>
            <input
              type="checkbox"
              checked={filters.openOnly}
              onChange={(e) => setFilters((p) => ({ ...p, openOnly: e.target.checked }))}
            />
            <span>Open only</span>
          </label>
        )}

        <div style={styles.actions}>
          <button
            onClick={() =>
              setFilters({ country: "", featuredOnly: false, verifiedOnly: false, openOnly: true })
            }
            style={styles.secondary}
          >
            Reset
          </button>
          <button onClick={onClose} style={styles.primary}>Apply</button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  backdrop: {
    position: "fixed", inset: 0,
    background: "rgba(0,0,0,0.6)",
    display: "flex", justifyContent: "center", alignItems: "center",
    padding: 16, zIndex: 50,
  },
  modal: {
    width: "min(520px, 100%)",
    borderRadius: 18,
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(10,10,30,0.92)",
    color: "white",
    padding: 14,
  },
  head: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  x: { background: "transparent", border: 0, color: "white", fontSize: 18, cursor: "pointer" },
  label: { display: "block", marginTop: 10, marginBottom: 6, opacity: 0.9 },
  input: {
    width: "100%", padding: "12px 12px", borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.14)", background: "rgba(0,0,0,0.25)",
    color: "white", outline: "none",
  },
  row: { display: "flex", alignItems: "center", gap: 10, marginTop: 12, cursor: "pointer" },
  actions: { display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 16 },
  primary: {
    padding: "10px 12px", borderRadius: 14,
    border: "1px solid rgba(160,80,255,0.55)", background: "rgba(160,80,255,0.25)",
    color: "white", cursor: "pointer",
  },
  secondary: {
    padding: "10px 12px", borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.18)", background: "transparent",
    color: "white", cursor: "pointer",
  },
};
