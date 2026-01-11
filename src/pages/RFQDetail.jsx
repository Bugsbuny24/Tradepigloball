import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import useFeatures from "../hooks/useFeatures";

import SupportBox from "../components/rfq/SupportBox";
import VoteBox from "../components/rfq/VoteBox";
import BoostBox from "../components/rfq/BoostBox";
import DropBox from "../components/rfq/DropBox";
import CollabBox from "../components/rfq/CollabBox";
import AnalyticsBox from "../components/rfq/AnalyticsBox";
import ReferralBox from "../components/growth/ReferralBox";
import AiBox from "../components/ai/AiBox";

export default function RFQDetail() {
  const { id } = useParams();
  const [rfq, setRfq] = useState(null);
  const features = useFeatures();

  useEffect(() => {
    fetch(`/api/rfqs-get?id=${id}`)
      .then(r => r.json())
      .then(setRfq);
  }, [id]);

  if (!rfq) return <div>Yükleniyor…</div>;

  return (
    <div style={{ padding: 20 }}>
      <h1>{rfq.title}</h1>
      <p>{rfq.description}</p>

      {rfq.cover_url && (
        <img src={rfq.cover_url} width="320" />
      )}

      <p>
        <strong>Destek:</strong>{" "}
        {rfq.current_credit} / {rfq.min_credit}
      </p>

      {features.support && <SupportBox rfqId={rfq.id} />}
      {features.vote && <VoteBox rfqId={rfq.id} />}
      {features.boost && <BoostBox rfqId={rfq.id} />}
      {features.analytics && <AnalyticsBox rfqId={rfq.id} />}
      {features.collab && <CollabBox rfqId={rfq.id} />}
      {features.ai && <AiBox rfqId={rfq.id} />}
      {features.referral && <ReferralBox />}

      {rfq.is_drop && <DropBox rfq={rfq} />}
    </div>
  );
}
