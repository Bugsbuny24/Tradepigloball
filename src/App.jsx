import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";

import BuyerSignup from "./pages/BuyerSignup";
import SellerSignup from "./pages/SellerSignup";
import SellerWaiting from "./pages/SellerWaiting";

import BuyerPanel from "./pages/BuyerPanel";
import SellerPanel from "./pages/SellerPanel";

// Store sayfaları varsa ekle (yoksa bu 2 satırı ve route'ları sil)
import Store from "./pages/Store";
import StoreCompany from "./pages/StoreCompany";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />

        {/* Auth flows */}
        <Route path="/buyer/signup" element={<BuyerSignup />} />
        <Route path="/seller/signup" element={<SellerSignup />} />
        <Route path="/seller/waiting" element={<SellerWaiting />} />

        {/* Panels */}
        <Route path="/buyer" element={<BuyerPanel />} />
        <Route path="/seller" element={<SellerPanel />} />

        {/* Store (public approved) */}
        <Route path="/store" element={<Store />} />
        <Route path="/store/company/:id" element={<StoreCompany />} />
      </Routes>
    </BrowserRouter>
  );
}
