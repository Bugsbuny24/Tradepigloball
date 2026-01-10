// src/components/CreditBadge.jsx
import { useEffect, useState } from 'react';
import { supabase } from '../api/supabase';

export default function CreditBadge() {
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from('credit_wallets')
        .select('balance')
        .single();
      setBalance(data?.balance ?? 0);
    };
    load();
  }, []);

  return (
    <div className="badge">
      💳 {balance} CREDIT
    </div>
  );
}
