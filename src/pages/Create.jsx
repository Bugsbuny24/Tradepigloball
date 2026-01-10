import { useState } from "react";
import StepProduct from "../steps/StepProduct";
import StepDesign from "../steps/StepDesign";
import StepMode from "../steps/StepMode";
import StepRFQ from "../steps/StepRFQ";
import StepReview from "../steps/StepReview";

export default function Create() {
  const [step, setStep] = useState(0);
  const [data, setData] = useState({
    productType: null,
    design: null,
    mode: "rfq",
    rfq: { title: "", description: "", minCredit: 0 }
  });

  const next = () => setStep(s => s + 1);
  const back = () => setStep(s => Math.max(0, s - 1));

  const steps = [
    <StepProduct data={data} setData={setData} onNext={next} />,
    <StepDesign data={data} setData={setData} onNext={next} onBack={back} />,
    <StepMode data={data} setData={setData} onNext={next} onBack={back} />,
    data.mode === "rfq"
      ? <StepRFQ data={data} setData={setData} onNext={next} onBack={back} />
      : null,
    <StepReview data={data} onBack={back} />
  ].filter(Boolean);

  return <div>{steps[step]}</div>;
}
