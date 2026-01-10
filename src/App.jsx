import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import AppShell from "./components/AppShell.jsx";

import Home from "./pages/Home.jsx";
import Explore from "./pages/Explore.jsx";
import RFQDetail from "./pages/RFQDetail.jsx";
import Login from "./pages/Login.jsx";

import Dashboard from "./pages/Dashboard.jsx";
import Create from "./pages/Create.jsx";
import CreateRFQ from "./pages/CreateRFQ.jsx";
import Wallet from "./pages/Wallet.jsx";
import MyRFQs from "./pages/MyRFQs.jsx";
import Profile from "./pages/Profile.jsx";
import TopUp from "./pages/TopUp.jsx";

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/rfq/:id" element={<RFQDetail />} />
        <Route path="/login" element={<Login />} />
      </Route>

      {/* Panel */}
      <Route element={<AppShell />}>
        <Route path="/app" element={<Navigate to="/app/dashboard" replace />} />
        <Route path="/app/dashboard" element={<Dashboard />} />
        <Route path="/app/create" element={<Create />} />
        <Route path="/app/create/rfq" element={<CreateRFQ />} />
        <Route path="/app/wallet" element={<Wallet />} />
        <Route path="/app/rfqs" element={<MyRFQs />} />
        <Route path="/app/profile" element={<Profile />} />
        <Route path="/app/topup" element={<TopUp />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
