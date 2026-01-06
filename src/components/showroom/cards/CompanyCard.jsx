import { Link } from "react-router-dom";

export default function CompanyCard({ c }) {
  return (
    <div style={styles.card}>
      <div style={styles.head}>
        {c.logo_url ? <img src={c.logo_url} alt={c.name} style={styles.logo} /> : <div style={styles.logoPh}>TPG</div>}
        <div style={{ flex: 1 }}>
          <div style={styles.name}>
            {c.name} {c.is_verified ? <span style={styles.verified}>Verified</span> : null}
          </div>
          <div style={styles.meta}>
            <span>{c.country || "—"}</span>
            <span>•</span>
            <span>{c.industry || "—"}</span>
          </div>
        </div>
      </div>

      <div style={styles.actions}>
        <Link to={`/company/${c.slug}`} style={styles.primaryLink}>
          Visit Store
        </Link>
      </div>
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
  head: { display: "flex", gap: 12, alignItems: "center" },
  logo: { width: 44, height: 44, borderRadius: 14, objectFit: "cover" },
  logoPh: {
    width: 44, height: 44, borderRadius: 14,
    display: "flex", alignItems: "center", justifyContent: "center",
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(0,0,0,0.2)",
    fontWeight: 800,
  },
  name: { fontWeight: 800, display: "flex", gap: 8, alignItems: "center" },
  verified: {
    fontSize: 12,
    padding: "4px 8px",
    borderRadius: 999,
    border: "1px solid rgba(120,255,180,0.35)",
    background: "rgba(120,255,180,0.14)",
  },
  meta: { display: "flex", gap: 8, opacity: 0.85, fontSize: 13, marginTop: 2 },
  actions: { marginTop: 12 },
  primaryLink: {
    display: "inline-block",
    padding: "10px 12px",
    borderRadius: 14,
    border: "1px solid rgba(160,80,255,0.55)",
    background: "rgba(160,80,255,0.25)",
    color: "white",
    textDecoration: "none",
    fontSize: 14,
  },
};
