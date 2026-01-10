import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function Feed() {
  const [rfqs, setRfqs] = useState([]);

  useEffect(() => {
    fetch("/api/rfqs-feed")
      .then(r => r.json())
      .then(setRfqs);
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h1>Keşfet</h1>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,300px)", gap: 20 }}>
        {rfqs.map(r => (
          <Link key={r.id} to={`/rfq/${r.id}`} style={{ textDecoration: "none", color: "black" }}>
            <div style={{ border: "1px solid #ddd", padding: 10 }}>
              {r.is_featured && <small>🔥 Featured</small>}
              <h3>{r.title}</h3>
              {r.cover_url && <img src={r.cover_url} width="100%" />}
              <p>{r.current_credit} / {r.min_credit}</p>
              {r.status === "production_ready" && <small>🟢 Production Ready</small>}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
