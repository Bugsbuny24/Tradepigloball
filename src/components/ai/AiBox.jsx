import { creditAction } from "../../utils/creditAction";

export default function AiBox({ rfqId }) {
  return (
    <button onClick={() =>
      creditAction({
        endpoint: "/api/ai-improve",
        payload: { rfq_id: rfqId },
        success: () => alert("AI iyileştirdi ✨"),
        fallback: () => alert("AI yakında 🤖")
      })
    }>
      ✨ AI İyileştir (5 Credit)
    </button>
  );
}
