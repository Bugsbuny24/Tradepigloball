import { creditAction } from "../../utils/creditAction";

export default function BoostBox({ rfqId }) {
  return (
    <div>
      <button onClick={() =>
        creditAction({
          endpoint: "/api/rfqs-boost",
          payload: { rfq_id: rfqId, hours: 24 },
          success: () => alert("Boost aktif 🚀"),
          fallback: () => alert("Boost yakında 🚧")
        })
      }>
        🚀 Boost (24s · 15 Credit)
      </button>
    </div>
  );
}
