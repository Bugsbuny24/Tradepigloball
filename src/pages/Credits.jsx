import React, { useEffect, useState } from "react";
import { getCredits } from "../lib/credits";
import { getAuthDebug } from "../lib/debugAuth";

export default function Credits() {
  const [credits, setCredits] = useState(0);
  const [dbg, setDbg] = useState(null);

  const refresh = async () => {
    const c = await getCredits();
    setCredits(c);
  };

  useEffect(() => {
    refresh();
    (async () => {
      try {
        const d = await getAuthDebug();
        setDbg(d);
      } catch {}
    })();
  }, []);

  return (
    <div style={{ padding: 16 }}>
      <h2>Credits</h2>
      <div style={{ marginBottom: 12 }}>
        Total: <b>{credits}</b>
      </div>

      {dbg && (
        <div style={{ opacity: 0.8, fontSize: 12 }}>
          <div><b>Auth Debug</b></div>
          <div>userId: {dbg.userId}</div>
          <div>email: {dbg.email}</div>
        </div>
      )}
    </div>
  );
}
