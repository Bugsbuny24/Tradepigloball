import { useState } from "react";

export default function SupportBox({ rfqId }) {
  const [loading, setLoading] = useState(false);

  const support = async () => {
    setLoading(true);
    await fetch("/api/rfqs-support", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rfq_id: rfqId, qty: 1 })
    });
    setLoading(false);
    alert("Destek verdin 🔥");
    window.location.reload();
  };

  return (
    <div style={{ marginTop: 20 }}>
      <button disabled={loading} onClick={support}>
        {loading ? "Bekle…" : "Destekle (5 Credit)"}
      </button>
    </div>
  );
        }
