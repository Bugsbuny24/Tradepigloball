import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Economy() {
  const [total, setTotal] = useState(0);

  useEffect(() => {
    supabase
      .from("credit_ledger")
      .select("amount")
      .then(({ data }) => {
        const sum = data.reduce((a,b)=>a+b.amount,0);
        setTotal(sum);
      });
  }, []);

  return (
    <>
      <h3>🔥 Total Burned Credit</h3>
      <h1>{Math.abs(total)}</h1>
    </>
  );
}
