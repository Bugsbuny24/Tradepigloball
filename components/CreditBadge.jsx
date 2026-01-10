// components/CreditBadge.jsx
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function CreditBadge() {
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("credit_wallets")
        .select("balance")
        .single();
      setBalance(data?.balance ?? 0);
    };
    load();
  }, []);

  return (
    <div style={{
      padding: "8px 12px",
      borderRadius: 12,
      background: "#111",
      color: "white",
      fontWeight: 700
    }}>
      💳 {balance} Credit
    </div>
  );
}
