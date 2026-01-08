import React from "react";
import { creditMe } from "../lib/credits";

export default function CreditBar() {
  const [credits, setCredits] = React.useState(null);

  async function refresh() {
    try {
      const c = await creditMe();
      setCredits(c);
    } catch {
      setCredits(null);
    }
  }

  React.useEffect(() => {
    refresh();
  }, []);

  return (
    <div style={{ fontWeight: 800, opacity: 0.9 }}>
      Credits:{" "}
      <span style={{ color: "rgba(180,255,180,.95)" }}>
        {credits === null ? "..." : credits}
      </span>
    </div>
  );
}
