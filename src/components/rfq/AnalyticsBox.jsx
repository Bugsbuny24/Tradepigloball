import { useState } from "react";

export default function AnalyticsBox({ rfqId }) {
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
        {data.map(d => (
          <li key={d.hour}>
            {new Date(d.hour).toLocaleString()} → {d.supports}
          </li>
        ))}
      </ul>
    </div>
  );
}
