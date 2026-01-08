import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { getCredits } from "../lib/credits";

export default function Credits() {
  const [credits, setCredits] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setCredits(0);
        setLoading(false);
        return;
      }

      const total = await getCredits(user.id);
      setCredits(total);
      setLoading(false);
    };

    run();
  }, []);

  if (loading) return <div style={{ padding: 20 }}>Loading...</div>;

  return (
    <div style={{ padding: 20 }}>
      <h2>Credits</h2>
      <p>
        Total: <b>{credits}</b>
      </p>
      <small>RFQ / Offer / Product işlemleri kredi kullanır.</small>
    </div>
  );
}
