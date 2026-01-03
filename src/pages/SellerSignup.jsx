import React, {useState} from 'react'
import { useNavigate } from 'react-router-dom'

export default function SellerSignup(){
  const [step, setStep] = useState(1)
  const nav = useNavigate()
  return (
    <div className="signup">
      <h1>Seller Signup</h1>
      <p>Step {step} of 3</p>
      <form onSubmit={(e)=>{e.preventDefault(); if(step<3) setStep(s=>s+1); else nav('/pricing')}}>
        {step===1 && <input placeholder="Company name" required />}
        {step===2 && <input placeholder="Store name" required />}
        {step===3 && <input placeholder="Email" required type="email" />}
        <div className="controls">
          {step>1 && <button type="button" onClick={()=>setStep(s=>s-1)}>Back</button>}
          <button type="submit">{step<3 ? 'Next' : 'Choose Package'}</button>
        </div>
      </form>
    </div>
  )
}
