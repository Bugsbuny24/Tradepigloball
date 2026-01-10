import { v4 as uuidv4 } from "uuid";

export default function SupportButton({ rfqId }) {
  const support = async () => {
    await fetch("/api/rfq-support", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        rfq_id: rfqId,
        idempotency_key: uuidv4()
      })
    });
    alert("🔥 Destek verildi (5 Credit)");
  };

  return <button onClick={support}>Destekle (5 Credit)</button>;
}
