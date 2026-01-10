// src/components/SupportButton.jsx
import { supabase } from '../api/supabase';

export default function SupportButton({ rfqId }) {
  const support = async () => {
    await supabase.rpc('support_rfq', {
      p_rfq_id: rfqId,
      p_qty: 1,
      p_idempotency_key: crypto.randomUUID()
    });
    alert('Destek verildi!');
  };

  return (
    <button onClick={support}>
      +1 Support (1 CREDIT)
    </button>
  );
}
