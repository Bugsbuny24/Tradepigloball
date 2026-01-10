// components/FeatureButton.jsx
import { supabase } from "../lib/supabase";

export default function FeatureButton({ rfqId }) {
  const feature = async () => {
    const { error } = await supabase.rpc("feature_rfq", {
      p_rfq_id: rfqId,
      p_hours: 24,
      p_idempotency_key: crypto.randomUUID()
    });

    if (error) {
      alert(error.message);
    } else {
      alert("⭐ RFQ Featured oldu (24h)");
    }
  };

  return (
    <button
      style={{
        background: "#ffd700",
        border: "none",
        padding: "8px 12px",
        borderRadius: 10,
        fontWeight: 700
      }}
      onClick={feature}
    >
      ⭐ Feature (50 Credit)
    </button>
  );
}
