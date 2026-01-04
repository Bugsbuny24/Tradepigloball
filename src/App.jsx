import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";

import BuyerSignup from "./pages/BuyerSignup";

// Company flow
import CompanyApply from "./pages/CompanyApply";
import CompanyWaiting from "./pages/CompanyWaiting";

// Owner
import PlatformOwnerRoute from "./components/PlatformOwnerRoute";
import OwnerPanel from "./pages/OwnerPanel";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />

      <Route path="/buyer/signup" element={<BuyerSignup />} />

      {/* Company onboarding */}
      <Route path="/company/apply" element={<CompanyApply />} />
      <Route path="/company/waiting" element={<CompanyWaiting />} />

      {/* Owner panel */}
      <Route
        path="/panel"
        element={
          <PlatformOwnerRoute>
            <OwnerPanel />
          </PlatformOwnerRoute>
        }
      />
    </Routes>
  );
}
