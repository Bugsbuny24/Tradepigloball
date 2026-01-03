import React from 'react'
import { useNavigate } from 'react-router-dom'

export default function USD(){
  const nav = useNavigate()
  return (
    <div className="mode-page">
      <h1>USD Mode</h1>
      <p>Global B2B marketplace operating in USD.</p>
      <div className="actions">
        <button onClick={()=>nav('/signup/buyer')}>Buyer Signup</button>
        <button onClick={()=>nav('/signup/seller')}>Seller Signup</button>
        <button onClick={()=>nav('/search')}>Search</button>
        <button onClick={()=>nav('/rfq')}>Create RFQ</button>
      </div>
    </div>
  )
}
