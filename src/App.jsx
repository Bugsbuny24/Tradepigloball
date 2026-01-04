import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";

import BuyerSignup from "./pages/BuyerSignup";
import BuyerPanel from "./pages/BuyerPanel";

import CompanyApply from "./pages/CompanyApply";
import CompanyWaiting from "./pages/CompanyWaiting";

import PlatformOwnerRoute from "./components/PlatformOwnerRoute";
import OwnerPanel from "./pages/OwnerPanel";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />

      {/* Buyer */}
      <Route path="/buyer/signup" element={<BuyerSignup />} />
      <Route path="/buyer" element={<BuyerPanel />} />

      {/* Company */}
      <Route path="/apply" element={<CompanyApply />} />
      <Route path="/company/waiting" element={<CompanyWaiting />} />

      {/* Owner (gizli panel) */}
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
