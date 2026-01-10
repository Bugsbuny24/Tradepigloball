// components/RFQCard.jsx
import SupportButton from "./SupportButton";
import FeatureButton from "./FeatureButton";

export default function RFQCard({ rfq }) {
  return (
    <div style={{
      border: "1px solid #eee",
      borderRadius: 16,
      padding: 14,
      marginBottom: 12
    }}>
      <h3>{rfq.title}</h3>
      <p>{rfq.description}</p>

      <div>
        🔥 {rfq.current_credit} Credit
        {rfq.is_featured && " ⭐ Featured"}
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
        <SupportButton rfqId={rfq.id} />
        <FeatureButton rfqId={rfq.id} />
      </div>
    </div>
  );
}
