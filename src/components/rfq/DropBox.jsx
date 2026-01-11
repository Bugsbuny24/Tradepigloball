import { creditAction } from "../../utils/creditAction";

export default function DropBox({ rfqId }) {
  return (
    <button onClick={() =>
      creditAction({
        endpoint: "/api/drop-join",
        payload: { rfq_id: rfqId },
        success: () => alert("Drop’a katıldın ⏱"),
        fallback: () => alert("Drop yakında 🚧")
      })
    }>
      ⏱ Drop’a Katıl (5 Credit)
    </button>
  );
}
