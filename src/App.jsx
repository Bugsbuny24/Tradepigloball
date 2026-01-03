import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import BuyerSignup from "./pages/BuyerSignup";
import SellerSignup from "./pages/SellerSignup";
import Pricing from "./pages/Pricing";
import Search from "./pages/Search";
import RFQ from "./pages/RFQ";
import ExpoCity from "./pages/ExpoCity";
import PI from "./pages/PI";
import USD from "./pages/USD";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/buyer/signup" element={<BuyerSignup />} />
        <Route path="/seller/signup" element={<SellerSignup />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/search" element={<Search />} />
        <Route path="/rfq" element={<RFQ />} />
        <Route path="/expocity" element={<ExpoCity />} />
        <Route path="/pi" element={<PI />} />
        <Route path="/usd" element={<USD />} />
      </Routes>
    </BrowserRouter>
  );
}
