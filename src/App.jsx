import { Routes, Route, Navigate } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";

import ProtectedRoute from "./components/ProtectedRoute";
import PlatformOwnerRoute from "./components/PlatformOwnerRoute";

import AdminGuard from "./admin/AdminGuard";
import AdminDashboard from "./admin/AdminDashboard";

import PiProducts from "./pages/PiProducts";
import CreateRfq from "./pages/CreateRfq";
import OwnerPanel from "./pages/OwnerPanel";

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* PI MODE (auth gerekli) */}
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

      {/* OWNER PANEL (system owner) */}
      <Route
        path="/admin"
        element={
          <PlatformOwnerRoute>
            <OwnerPanel />
          </PlatformOwnerRoute>
        }
      />

      {/* ADMIN DASHBOARD (opsiyonel / app_admins) */}
      <Route
        path="/admin-dashboard"
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
