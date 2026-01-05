import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import OwnerPanel from "./pages/OwnerPanel";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />

        {/* 🔑 LOGIN ROUTE */}
        <Route path="/login" element={<Login />} />

        {/* OWNER PANEL */}
        <Route path="/owner" element={<OwnerPanel />} />

        {/* HER ŞEY ELSE ANA SAYFA */}
        <Route path="*" element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
}
