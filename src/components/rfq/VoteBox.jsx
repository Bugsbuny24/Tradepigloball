import { creditAction } from "../../utils/creditAction";

export default function VoteBox({ rfqId }) {
  return (
    <button onClick={() =>
      creditAction({
        endpoint: "/api/rfqs-vote",
        payload: { rfq_id: rfqId },
        success: () => alert("Oy verdin 🗳"),
        fallback: () => alert("Vote yakında 🚧")
      })
    }>
      🗳 Oy Ver (5 Credit)
    </button>
  );
}
