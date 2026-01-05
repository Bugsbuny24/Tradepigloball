import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import OwnerPanel from "./pages/OwnerPanel";

import PlatformOwnerRoute from "./components/PlatformOwnerRoute";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/login" element={<Login />} />

        <Route
          path="/owner"
          element={
            <PlatformOwnerRoute>
              <OwnerPanel />
            </PlatformOwnerRoute>
          }
        />

        {/* default */}
        <Route path="*" element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
}
