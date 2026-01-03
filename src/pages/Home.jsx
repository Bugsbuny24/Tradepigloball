import React from 'react'
import { useNavigate } from 'react-router-dom'

export default function Home(){
  const nav = useNavigate()
  return (
    <div className="home">
      <h1>Choose a Mode</h1>

      <section className="card usd">
        <h2>USD MODE</h2>
        <p>Global B2B Trade</p>
        <button onClick={()=>nav('/usd')}>Enter USD Mode</button>
      </section>

      <section className="card pi">
        <h2>PI MODE</h2>
        <p>Pi-Ecosystem B2B Showroom</p>
        <button onClick={()=>nav('/pi')}>Browse Products</button>
        <button onClick={()=>nav('/rfq')}>Create RFQ</button>
      </section>

      <section className="card expo">
        <h2>EXPO CITY</h2>
        <p>Digital Trade Pavilion</p>
        <button onClick={()=>nav('/expo')}>Enter Expo City</button>
      </section>
    </div>
  )
}
