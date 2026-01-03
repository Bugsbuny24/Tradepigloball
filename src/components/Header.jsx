import React from 'react'
import { Link } from 'react-router-dom'

export default function Header(){
  return (
    <header className="site-header">
      <div className="logo">Tradepigloball</div>
      <nav>
        <Link to="/">Home</Link>
        <Link to="/search">Search</Link>
        <Link to="/pricing">Seller Packages</Link>
      </nav>
    </header>
  )
}
