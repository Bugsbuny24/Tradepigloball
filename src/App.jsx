import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import BuyerSignup from "./pages/BuyerSignup";
import SellerSignup from "./pages/SellerSignup";
import BuyerPanel from "./pages/BuyerPanel";
import SellerPanel from "./pages/SellerPanel";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />

        <Route path="/buyer/signup" element={<BuyerSignup />} />
        <Route path="/seller/signup" element={<SellerSignup />} />

        <Route path="/buyer" element={<BuyerPanel />} />
        <Route path="/seller" element={<SellerPanel />} />
      </Routes>
    </BrowserRouter>
  );
}
