import React from 'react'
import { useNavigate } from 'react-router-dom'

export default function PI(){
  const nav = useNavigate()
  return (
    <div className="mode-page">
      <h1>PI Mode</h1>
      <p>Pi-Ecosystem B2B Showroom</p>
      <div className="actions">
        <button onClick={()=>nav('/search')}>Browse Products</button>
        <button onClick={()=>nav('/rfq')}>Create RFQ</button>
        <button onClick={()=>nav('/signup/seller')}>Seller Packages</button>
      </div>
    </div>
  )
}
