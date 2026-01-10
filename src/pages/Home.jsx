import { useEffect, useState } from "react";

export default function Home() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/feed")
      .then(r => r.json())
      .then(j => {
        if (!j.ok) throw new Error(j.error || "Feed error");
        setItems(j.items || []);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h1>RFQ Feed</h1>

      {loading && <p>Yükleniyor…</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {!loading && items.length === 0 && (
        <p>Henüz RFQ yok.</p>
      )}

      <div style={{ display: "grid", gap: 12 }}>
        {items.map(r => (
          <div
            key={r.id}
            style={{
              border: "1px solid #ddd",
              padding: 12,
              borderRadius: 6
            }}
          >
            <h3>{r.title}</h3>
            <p>{r.description}</p>
            <small>
              Credit: {r.current_credit} / {r.min_credit}
            </small>
          </div>
        ))}
      </div>
    </div>
  );
}
