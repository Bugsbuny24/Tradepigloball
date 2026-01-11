import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";

// ===== Public Pages =====
import Feed from "./pages/Feed";
import Login from "./pages/Login";
import Create from "./pages/Create";
import CreateRFQ from "./pages/CreateRFQ";
import RFQDetail from "./pages/RFQDetail";
import Wallet from "./pages/Wallet";
import TopUp from "./pages/TopUp";
import CreatorProfile from "./pages/CreatorProfile";
import CuratorPanel from "./pages/CuratorPanel";

// ===== Admin =====
import AdminGuard from "./pages/admin/AdminGuard";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminHome from "./admin/pages/AdminHome";
import AdminUsers from "./admin/pages/AdminUsers";
import AdminRFQ from "./admin/pages/AdminRFQ";
import AdminSystem from "./admin/pages/AdminSystem";

export default function App() {
  return (
    <Routes>
      {/* PUBLIC LAYOUT */}
      <Route element={<Layout />}>
        <Route path="/" element={<Feed />} />
        <Route path="/login" element={<Login />} />
        <Route path="/rfq/:id" element={<RFQDetail />} />

        {/* APP */}
        <Route path="/create" element={<Create />} />
        <Route path="/create/rfq" element={<CreateRFQ />} />
        <Route path="/wallet" element={<Wallet />} />
        <Route path="/topup" element={<TopUp />} />
        <Route path="/creator/:id" element={<CreatorProfile />} />
        <Route path="/curator" element={<CuratorPanel />} />
      </Route>

      {/* ADMIN (KAPALI & GÜVENLİ) */}
      <Route
        path="/admin"
        element={
          <AdminGuard>
            <AdminLayout />
          </AdminGuard>
        }
      >
        <Route index element={<AdminHome />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="rfqs" element={<AdminRFQ />} />
        <Route path="system" element={<AdminSystem />} />
      </Route>

      {/* FALLBACK */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
