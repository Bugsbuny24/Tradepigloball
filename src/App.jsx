import { Routes, Route, Navigate } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";

import ProtectedRoute from "./components/ProtectedRoute";
import PlatformOwnerRoute from "./components/PlatformOwnerRoute";

import OwnerPanel from "./pages/OwnerPanel";
import PiProducts from "./pages/PiProducts";
import CreateRfq from "./pages/CreateRfq";

import CompanyApply from "./pages/CompanyApply";
import CompanyWaiting from "./pages/CompanyWaiting";

import AdminGuard from "./admin/AdminGuard";
import AdminDashboard from "./admin/AdminDashboard";

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Company flow */}
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

      {/* Owner Panel (admin-only sade) */}
      <Route
        path="/admin"
        element={
          <PlatformOwnerRoute>
            <OwnerPanel />
          </PlatformOwnerRoute>
        }
      />

      {/* (Eğer hâlâ admin klasörünü kullanacaksan) */}
      <Route
        path="/admin/*"
        element={
          <AdminGuard>
            <AdminDashboard />
          </AdminGuard>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
