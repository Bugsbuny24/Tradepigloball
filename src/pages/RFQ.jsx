import React from 'react'

export default function RFQ(){
  return (
    <div className="rfq">
      <h1>Create RFQ</h1>
      <form onSubmit={(e)=>{e.preventDefault(); alert('RFQ submitted (placeholder)')}}>
        <input placeholder="Product name" required />
        <input placeholder="Quantity" required />
        <textarea placeholder="Details" />
        <button type="submit">Submit RFQ</button>
      </form>
    </div>
  )
}
