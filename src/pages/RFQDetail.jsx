import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function RFQDetail() {
  const { id } = useParams();
  const [rfq, setRfq] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`/api/rfqs-get?id=${id}`)
      .then(r => r.json())
      .then(setRfq);
  }, [id]);

  const support = async () => {
    setLoading(true);
    await fetch("/api/rfqs-support", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        rfq_id: id,
        qty: 1
      })
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
        <img src={rfq.cover_url} width="300" />
      )}

      <div style={{ marginTop: 20 }}>
        <strong>Destek:</strong> {rfq.current_credit} / {rfq.min_credit}
      </div>

      <div style={{ marginTop: 20 }}>
        <button disabled={loading} onClick={support}>
          {loading ? "Bekle…" : "Destekle (5 Credit)"}
        </button>
      </div>

      <div style={{ marginTop: 10 }}>
        <small>Status: {rfq.status}</small>
      </div>
    </div>
  );
}
