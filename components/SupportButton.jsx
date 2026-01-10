// components/SupportButton.jsx
import { supabase } from "../lib/supabase";

export default function SupportButton({ rfqId }) {
  const support = async () => {
    const { error } = await supabase.rpc("support_rfq", {
      p_rfq_id: rfqId,
      p_qty: 1,
      p_idempotency_key: crypto.randomUUID()
    });

    if (error) {
      alert(error.message);
    } else {
      alert("🔥 Support verildi (1 Credit)");
    }
  };

  return (
    <button onClick={support}>
      🔥 Support (1 Credit)
    </button>
  );
}
