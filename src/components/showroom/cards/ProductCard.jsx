import { Link } from "react-router-dom";

export default function ProductCard({ p }) {
  return (
    <div style={styles.card}>
      <div style={styles.imgWrap}>
        {p.image_url ? (
          <img src={p.image_url} alt={p.title} style={styles.img} />
        ) : (
          <div style={styles.imgPh}>No image</div>
        )}
        {p.is_featured && <div style={styles.badge}>FEATURED</div>}
      </div>

      <div style={styles.body}>
        <div style={styles.title}>{p.title}</div>
        <div style={styles.meta}>
          <span>{p.country || "—"}</span>
          <span>•</span>
          <span>MOQ: {p.moq ?? "—"}</span>
        </div>

        <div style={styles.actions}>
          <Link to="/pi/rfq/create" style={styles.primaryLink}>
            Request Quote
          </Link>
          {/* şirket sayfasını sonra bağlayacağız */}
          <span style={styles.secondaryText}>by company</span>
        </div>
      </div>
    </div>
  );
}

const styles = {
  card: {
    borderRadius: 18,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(10,10,30,0.65)",
    overflow: "hidden",
  },
  imgWrap: { position: "relative", aspectRatio: "16/10", background: "rgba(0,0,0,0.2)" },
  img: { width: "100%", height: "100%", objectFit: "cover", display: "block" },
  imgPh: { width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", opacity: 0.7 },
  badge: {
    position: "absolute", top: 10, left: 10,
    padding: "6px 10px", borderRadius: 999,
    border: "1px solid rgba(160,80,255,0.55)",
    background: "rgba(160,80,255,0.22)",
    fontSize: 12,
  },
  body: { padding: 12 },
  title: { fontWeight: 700, marginBottom: 6 },
  meta: { display: "flex", gap: 8, opacity: 0.85, fontSize: 13, marginBottom: 10 },
  actions: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 },
  primaryLink: {
    padding: "10px 12px",
    borderRadius: 14,
    border: "1px solid rgba(160,80,255,0.55)",
    background: "rgba(160,80,255,0.25)",
    color: "white",
    textDecoration: "none",
    fontSize: 14,
  },
  secondaryText: { opacity: 0.75, fontSize: 13 },
};
