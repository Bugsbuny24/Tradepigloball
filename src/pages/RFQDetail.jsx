import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import SupportBox from "../components/rfq/SupportBox";
import FeatureBox from "../components/rfq/FeatureBox";
import DropBox from "../components/rfq/DropBox";
import CollabBox from "../components/rfq/CollabBox";
import AnalyticsBox from "../components/rfq/AnalyticsBox";
import { FEATURES } from "../config/features";
import VoteBox from "../components/rfq/VoteBox";
import BoostBox from "../components/rfq/BoostBox";
import AiImproveBox from "../components/ai/AiImproveBox";
import useFeatures from "../hooks/useFeatures";
import ReferralBox from "../components/growth/ReferralBox";
import LocalProducerBox from "../components/producer/LocalProducerBox";
import CreatorBonusBox from "../components/creator/CreatorBonusBox";
import useFeatures from "../hooks/useFeatures";
import SupportBox from "../components/rfq/SupportBox";
import VoteBox from "../components/rfq/VoteBox";
import BoostBox from "../components/rfq/BoostBox";
import DropBox from "../components/rfq/DropBox";
import ReferralBox from "../components/growth/ReferralBox";
import AiBox from "../components/ai/AiBox";

const f = useFeatures();

{f.support && <SupportBox rfqId={rfq.id} />}
{f.vote && <VoteBox rfqId={rfq.id} />}
{f.boost && <BoostBox rfqId={rfq.id} />}
{f.drop && <DropBox rfqId={rfq.id} />}
{f.ai && <AiBox rfqId={rfq.id} />}
{f.referral && <ReferralBox />}
export default function RFQDetail() {
  const { id } = useParams();
  const f = useFeatures();

{f.support && <SupportBox rfqId={rfq.id} />}
{f.vote && <VoteBox rfqId={rfq.id} />}
{f.boost && <BoostBox rfqId={rfq.id} />}
{f.drop && <DropBox rfqId={rfq.id} />}
{f.ai && <AiBox rfqId={rfq.id} />}
{f.referral && <ReferralBox />}
  const [rfq, setRfq] = useState(null);
const f = useFeatures();
{f.referral && <ReferralBox />}
{f.localProducer && <LocalProducerBox rfqId={rfq.id} />}
{f.creatorBonus && <CreatorBonusBox />}
{f.vote && <VoteBox rfqId={rfq.id} />}
{f.boost && <BoostBox rfqId={rfq.id} />}
{f.ai && (
  <>
    <AiImproveBox field="title" />
    <AiImproveBox field="description" />
  </>
)}
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

      <SupportBox rfqId={rfq.id} />
      <FeatureBox rfqId={rfq.id} />
      <AnalyticsBox rfqId={rfq.id} />
      <CollabBox rfqId={rfq.id} />
{FEATURES.RFQ_SUPPORT && <SupportBox rfqId={rfq.id} />}

{FEATURES.RFQ_FEATURE && <FeatureBox rfqId={rfq.id} />}

{FEATURES.RFQ_ANALYTICS && <AnalyticsBox rfqId={rfq.id} />}

{FEATURES.COLLAB && <CollabBox rfqId={rfq.id} />}

{FEATURES.DROP && rfq.is_drop && <DropBox rfq={rfq} />}
      {rfq.is_drop && <DropBox rfq={rfq} />}
    </div>
  );
}
