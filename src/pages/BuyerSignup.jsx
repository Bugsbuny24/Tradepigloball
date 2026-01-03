import React, {useState} from 'react'

export default function BuyerSignup(){
  const [step, setStep] = useState(1)
  return (
    <div className="signup">
      <h1>Buyer Signup</h1>
      <p>Step {step} of 3</p>
      <form onSubmit={(e)=>{e.preventDefault(); setStep(s=>Math.min(3,s+1))}}>
        {step===1 && <input placeholder="Company name" required />}
        {step===2 && <input placeholder="Contact person" required />}
        {step===3 && <input placeholder="Email" required type="email" />}
        <div className="controls">
          {step>1 && <button type="button" onClick={()=>setStep(s=>s-1)}>Back</button>}
          <button type="submit">{step<3 ? 'Next' : 'Finish'}</button>
        </div>
      </form>
    </div>
  )
}
