import React from "react";
import { supabase } from "../lib/supabase";
import { walletMe } from "../lib/credits";

export default function CreditBar() {
  const [user, setUser] = React.useState(null);
  const [balance, setBalance] = React.useState(null);

  async function refresh() {
    try {
      const b = await walletMe();
      setBalance(b);
    } catch (e) {
      setBalance(null);
    }
  }

  React.useEffect(() => {
    // ilk user
    supabase.auth.getUser().then(({ data }) => setUser(data?.user ?? null));

    // auth değişimleri
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u) refresh();
      else setBalance(null);
    });

    return () => sub?.subscription?.unsubscribe?.();
  }, []);

  React.useEffect(() => {
    if (user) refresh();
  }, [user]);

  if (!user) return null;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 10,
        padding: "10px 12px",
        borderRadius: 14,
        border: "1px solid rgba(255,255,255,.12)",
        background: "rgba(0,0,0,.18)",
        marginBottom: 12,
      }}
    >
      <div style={{ fontWeight: 700, opacity: 0.9 }}>Wallet</div>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ opacity: 0.8, fontSize: 13 }}>
          Credits: <b>{balance === null ? "…" : balance}</b>
        </div>
        <button
          onClick={refresh}
          style={{
            padding: "8px 10px",
            borderRadius: 12,
            border: "1px solid rgba(255,255,255,.12)",
            background: "rgba(255,255,255,.08)",
            color: "white",
            cursor: "pointer",
          }}
        >
          Refresh
        </button>
      </div>
    </div>
  );
}
