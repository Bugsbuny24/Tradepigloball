import { creditAction } from "../../utils/creditAction";

export default function SupportBox({ rfqId }) {
  return (
    <button onClick={() =>
      creditAction({
        endpoint: "/api/rfqs-support",
        payload: { rfq_id: rfqId, qty: 1 },
        success: () => alert("Destek verdin 🔥 (5 Credit)"),
        fallback: () => alert("Support yakında 🚧")
      })
    }>
      🔥 Destekle (5 Credit)
    </button>
  );
}
