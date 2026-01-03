import React, {useState} from 'react'

export default function Search(){
  const [q, setQ] = useState('')
  return (
    <div className="search">
      <h1>Search</h1>
      <form onSubmit={(e)=>{e.preventDefault(); alert('Search for: '+q)}}>
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search products or suppliers" />
        <button type="submit">Search</button>
      </form>
    </div>
  )
}
