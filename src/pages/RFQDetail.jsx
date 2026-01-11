import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

/* =======================
   SUB COMPONENTS
======================= */

function FeatureBox({ rfqId }) {
  const feature = async (hours) => {
    await fetch("/api/rfqs-feature", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rfq_id: rfqId, hours })
    });
    alert("Öne çıkarıldı 🔥");
    window.location.reload();
  };

  return (
    <div style={{ marginTop: 20 }}>
      <h4>Öne Çıkar</h4>
      <button onClick={() => feature(24)}>24s · 10 Credit</button>
      <button onClick={() => feature(72)}>3g · 25 Credit</button>
      <button onClick={() => feature(168)}>7g · 50 Credit</button>
    </div>
  );
}

function AnalyticsBox({ rfqId }) {
  const [data, setData] = useState(null);

  const load = async () => {
    const r = await fetch(`/api/rfqs-analytics?rfq_id=${rfqId}`);
    setData(await r.json());
  };

  if (!data) {
    return (
      <button
        onClick={async () => {
          await fetch("/api/rfqs-analytics-unlock", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ rfq_id: rfqId })
          });
          load();
        }}
      >
        📊 Analytics Aç (20 Credit)
      </button>
    );
  }

  return (
    <div>
      <h4>Destek Zaman Grafiği</h4>
      <ul>
        {data.map((d) => (
          <li key={d.hour}>
            {new Date(d.hour).toLocaleString()} → {d.supports}
          </li>
        ))}
      </ul>
    </div>
  );
}

function DropBox({ rfq }) {
  const join = async () => {
    await fetch("/api/drop-join", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rfq_id: rfq.id })
    });
    alert("Drop’a katıldın ⏱");
  };

  if (!rfq.drop_ends_at) return null;

  const ends = new Date(rfq.drop_ends_at);

  return (
    <div style={{ marginTop: 20 }}>
      <p>Bitiyor: {ends.toLocaleString()}</p>
      <button onClick={join}>Katıl (5 Credit)</button>
    </div>
  );
}

/* =======================
   MAIN COMPONENT
======================= */

export default function RFQDetail() {
  const { id } = useParams();
  const [rfq, setRfq] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`/api/rfqs-get?id=${id}`)
      .then((r) => r.json())
      .then(setRfq);
  }, [id]);

  const support = async () => {
    setLoading(true);
    await fetch("/api/rfqs-support", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rfq_id: id, qty: 1 })
    });
    setLoading(false);
    alert("Destek verdin 🔥");
    window.location.reload();
  };

  if (!rfq) return <div>Yükleniyor…</div>;

  return (
    <div style={{ padding: 20 }}>
      <h1>{rfq.title}</h1>
      <p>{rfq.description}</p>

      {rfq.cover_url && (
        <img src={rfq.cover_url} width="300" alt="rfq" />
      )}

      <div style={{ marginTop: 20 }}>
        <strong>Destek:</strong> {rfq.current_credit} / {rfq.min_credit}
      </div>

      <div style={{ marginTop: 20 }}>
        <button disabled={loading} onClick={support}>
          {loading ? "Bekle…" : "Destekle (5 Credit)"}
        </button>
      </div>

      <FeatureBox rfqId={rfq.id} />
      <AnalyticsBox rfqId={rfq.id} />
      <DropBox rfq={rfq} />

      <div style={{ marginTop: 10 }}>
        <small>Status: {rfq.status}</small>
      </div>
    </div>
  );
}
