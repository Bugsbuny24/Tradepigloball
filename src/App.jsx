import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";

// Pages
import Feed from "./pages/Feed";
import Login from "./pages/Login";
import Create from "./pages/Create";
import CreateRFQ from "./pages/CreateRFQ";
import RFQDetail from "./pages/RFQDetail";
import Wallet from "./pages/Wallet";
import TopUp from "./pages/TopUp";
import CreatorProfile from "./pages/CreatorProfile";
import CuratorPanel from "./pages/CuratorPanel";

export default function App() {
  return (
    <Routes>
      {/* Layout wrapper */}
      <Route element={<Layout />}>
        {/* Public */}
        <Route path="/" element={<Feed />} />
        <Route path="/login" element={<Login />} />
        <Route path="/rfq/:id" element={<RFQDetail />} />

        {/* App / Panel */}
        <Route path="/create" element={<Create />} />
        <Route path="/create/rfq" element={<CreateRFQ />} />
        <Route path="/wallet" element={<Wallet />} />
        <Route path="/topup" element={<TopUp />} />
        <Route path="/creator/:id" element={<CreatorProfile />} />
        <Route path="/curator" element={<CuratorPanel />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
