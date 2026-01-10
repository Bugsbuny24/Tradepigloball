// src/pages/RFQDetail.jsx
import SupportButton from '../components/SupportButton';

export default function RFQDetail({ rfq }) {
  return (
    <div>
      <h2>{rfq.title}</h2>
      <p>{rfq.description}</p>
      <SupportButton rfqId={rfq.id} />
    </div>
  );
}
