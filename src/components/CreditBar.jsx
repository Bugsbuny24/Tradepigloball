import React from "react";
import { creditEnsure, creditMe } from "../lib/credits";
import { supabase } from "../lib/supabase";

export default function CreditBar() {
  const [balance, setBalance] = React.useState(null);

  async function refresh() {
    const { data } = await supabase.auth.getSession();
    if (!data?.session) {
      setBalance(null);
      return;
    }
    await creditEnsure();
    const b = await creditMe();
    setBalance(b);
  }

  React.useEffect(() => {
    refresh();

    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      refresh();
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  if (balance === null) return null;

  return (
    <div style={{
      position: "sticky",
      top: 0,
      zIndex: 50,
      padding: 10,
      marginBottom: 10,
      borderRadius: 12,
      border: "1px solid rgba(255,255,255,.12)",
      background: "rgba(0,0,0,.35)",
      color: "white",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      backdropFilter: "blur(8px)"
    }}>
      <div><b>Credits</b>: {balance}</div>
      <button onClick={refresh} style={{
        padding: "6px 10px",
        borderRadius: 10,
        border: "1px solid rgba(255,255,255,.18)",
        background: "rgba(255,255,255,.08)",
        color: "white",
        cursor: "pointer"
      }}>
        Refresh
      </button>
    </div>
  );
}
