import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import Home from './pages/Home'
import USD from './pages/USD'
import PI from './pages/PI'
import ExpoCity from './pages/ExpoCity'
import BuyerSignup from './pages/BuyerSignup'
import SellerSignup from './pages/SellerSignup'
import RFQ from './pages/RFQ'
import Search from './pages/Search'
import Pricing from './pages/Pricing'

export default function App(){
  return (
    <div className="app-root">
      <Header />
      <main className="container">
        <Routes>
          <Route path="/" element={<Home/>} />
          <Route path="/usd" element={<USD/>} />
          <Route path="/pi" element={<PI/>} />
          <Route path="/expo" element={<ExpoCity/>} />
          <Route path="/signup/buyer" element={<BuyerSignup/>} />
          <Route path="/signup/seller" element={<SellerSignup/>} />
          <Route path="/rfq" element={<RFQ/>} />
          <Route path="/search" element={<Search/>} />
          <Route path="/pricing" element={<Pricing/>} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}
