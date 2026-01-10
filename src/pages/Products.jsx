import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function Products() {
  const [items, setItems] = useState([]);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        // RFQ Feed (API endpoint: /api/feed)
        const r = await fetch("/api/feed");
        const j = await r.json();
        if (!r.ok) throw new Error(j?.error || "Feed alınamadı");
        setItems(j.items || []);
      } catch (e) {
        setErr(e.message || "Hata");
      }
    })();
  }, []);

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>RFQ Feed</h1>

        {/* Şimdilik basit yönlendirme. RFQ Create sayfasını ekleyince /rfq/create yaparız */}
        <Link to="/login">Login</Link>
      </div>

      <p style={{ opacity: 0.8 }}>
        Marketplace/Cart kapalı. Model: <b>RFQ + Credit</b>.
      </p>

      {err && <p style={{ color: "crimson" }}>{err}</p>}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
        {(items || []).map((x) => (
          <div key={x.id} style={{ border: "1px solid #ddd", padding: 12, borderRadius: 10 }}>
            <div style={{ fontWeight: "bold", marginBottom: 6 }}>{x.title}</div>
            <div style={{ fontSize: 13, opacity: 0.8, marginBottom: 10 }}>
              {x.description?.slice(0, 140) || "—"}
            </div>

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
              {Array.isArray(x.tags) && x.tags.slice(0, 6).map((t) => (
                <span key={t} style={{ fontSize: 12, border: "1px solid #eee", padding: "2px 8px", borderRadius: 999 }}>
                  {t}
                </span>
              ))}
            </div>

            <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 10 }}>
              Credit: <b>{x.current_credit ?? 0}</b> / Min: <b>{x.min_credit ?? 0}</b>
            </div>

            <a href={`/api/rfqs-get?id=${x.id}`} target="_blank" rel="noreferrer">
              JSON Detay
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
