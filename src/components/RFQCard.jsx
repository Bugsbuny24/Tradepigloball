// src/components/RFQCard.jsx
import FeaturedBadge from './FeaturedBadge';

export default function RFQCard({ rfq }) {
  return (
    <div className="card">
      {rfq.is_featured && <FeaturedBadge />}
      <h3>{rfq.title}</h3>
      <p>{rfq.description}</p>
      <div>
        🔥 {rfq.current_credit} / {rfq.min_credit}
      </div>
    </div>
  );
}
