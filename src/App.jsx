import { Routes, Route, Navigate } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";

import ProtectedRoute from "./components/ProtectedRoute";
import PlatformOwnerRoute from "./components/PlatformOwnerRoute";

import PiProducts from "./pages/PiProducts";
import CreateRfq from "./pages/CreateRfq";
import CompanyStand from "./pages/CompanyStand";
import CompanyApply from "./pages/CompanyApply";
import CompanyWaiting from "./pages/CompanyWaiting";
import OwnerPanel from "./pages/OwnerPanel";

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* PI MODE */}
      <Route
        path="/pi/products"
        element={
          <ProtectedRoute>
            <PiProducts />
          </ProtectedRoute>
        }
      />

      <Route
        path="/pi/rfq/create"
        element={
          <ProtectedRoute>
            <CreateRfq />
          </ProtectedRoute>
        }
      />

      {/* Company Apply / Waiting */}
      <Route
        path="/company/apply"
        element={
          <ProtectedRoute>
            <CompanyApply />
          </ProtectedRoute>
        }
      />
      <Route
        path="/company/waiting"
        element={
          <ProtectedRoute>
            <CompanyWaiting />
          </ProtectedRoute>
        }
      />

      {/* Company Stand (Public) */}
      <Route path="/company/:slug" element={<CompanyStand />} />

      {/* Owner Panel */}
      <Route
        path="/admin"
        element={
          <PlatformOwnerRoute>
            <OwnerPanel />
          </PlatformOwnerRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
