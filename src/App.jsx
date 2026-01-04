import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import BuyerSignup from "./pages/BuyerSignup";
import SellerSignup from "./pages/SellerSignup";
import SellerWaiting from "./pages/SellerWaiting";
import BuyerPanel from "./pages/BuyerPanel";
import SellerPanel from "./pages/SellerPanel";

import PlatformOwnerRoute from "./components/PlatformOwnerRoute";
import OwnerPanel from "./pages/OwnerPanel";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />

      <Route path="/buyer/signup" element={<BuyerSignup />} />
      <Route path="/seller/signup" element={<SellerSignup />} />

      <Route path="/buyer" element={<BuyerPanel />} />
      <Route path="/seller" element={<SellerPanel />} />
      <Route path="/seller/waiting" element={<SellerWaiting />} />

      {/* Gizli Owner Panel (link yok, sadece URL ile) */}
      <Route
        path="/owner"
        element={
          <PlatformOwnerRoute>
            <OwnerPanel />
          </PlatformOwnerRoute>
        }
      />
    </Routes>
  );
}
