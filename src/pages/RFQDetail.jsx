import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import useFeatures from "../hooks/useFeatures";

import SupportBox from "../components/rfq/SupportBox";
import VoteBox from "../components/rfq/VoteBox";
import BoostBox from "../components/rfq/BoostBox";
import DropBox from "../components/rfq/DropBox";
import AnalyticsBox from "../components/rfq/AnalyticsBox";
import CollabBox from "../components/rfq/CollabBox";
import AiBox from "../components/ai/AiBox";
import ReferralBox from "../components/growth/ReferralBox";

export default function RFQDetail() {
  const { id } = useParams();
  const [rfq, setRfq] = useState(null);

  // Şimdilik user yok → null geçiyoruz
  const f = useFeatures(null);

  useEffect(() => {
    fetch(`/api/rfqs-get?id=${id}`)
      .then((r) => r.json())
      .then(setRfq);
  }, [id]);

  if (!rfq) return <div>Yükleniyor…</div>;

  return (
    <div style={{ padding: 20 }}>
      <h1>{rfq.title}</h1>
      <p>{rfq.description}</p>

      {rfq.cover_url && (
        <img src={rfq.cover_url} width="320" alt="cover" />
      )}

      <p>
        <strong>Destek:</strong> {rfq.current_credit} / {rfq.min_credit}
      </p>

      {f.can("support") && <SupportBox rfqId={rfq.id} />}
      {f.can("vote") && <VoteBox rfqId={rfq.id} />}
      {f.can("boost") && <BoostBox rfqId={rfq.id} />}
      {f.can("analytics") && <AnalyticsBox rfqId={rfq.id} />}
      {f.can("collab") && <CollabBox rfqId={rfq.id} />}
      {f.can("ai") && <AiBox rfq={rfq} />}
      {f.can("referral") && <ReferralBox rfqId={rfq.id} />}

      {f.can("drop") && rfq.is_drop && <DropBox rfq={rfq} />}
    </div>
  );
}
