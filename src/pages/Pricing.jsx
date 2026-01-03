import React from 'react'

export default function Pricing(){
  const packages = [
    {id:1, name:'Starter', price:'$19/mo', features:['Basic store','5 products']},
    {id:2, name:'Business', price:'$59/mo', features:['Featured store','50 products','Analytics']},
    {id:3, name:'Enterprise', price:'Contact', features:['Unlimited','Dedicated support']}
  ]
  return (
    <div className="pricing">
      <h1>Seller Packages</h1>
      <div className="packages">
        {packages.map(p=> (
          <div key={p.id} className="package">
            <h3>{p.name}</h3>
            <p className="price">{p.price}</p>
            <ul>
              {p.features.map((f,i)=>(<li key={i}>{f}</li>))}
            </ul>
            <button onClick={()=>alert('Selected '+p.name)}>Choose</button>
          </div>
        ))}
      </div>
    </div>
  )
}
