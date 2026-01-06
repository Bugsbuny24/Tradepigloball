
// App.jsx
import { Routes, Route } from "react-router-dom";
import AdminGuard from "./routes/AdminGuard";
import AdminPage from "./pages/AdminPage";

import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProtectedRoute from "./components/ProtectedRoute";
import RequireRole from "./components/RequireRole";

import PiProducts from "./pages/PiProducts";
import CreateRfq from "./pages/CreateRfq";
import ExpoCity from "./pages/ExpoCity";
import OwnerPanel from "./pages/OwnerPanel"; // <-- bunu ekle

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />

      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

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

      <Route path="/expo-city" element={<ExpoCity />} />

      {/* OWNER PANEL */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <RequireRole allow={["owner", "admin"]}>
              <OwnerPanel />
            </RequireRole>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
<Routes>
  <Route element={<AdminGuard />}>
    <Route path="/admin" element={<AdminPage />} />
  </Route>
</Routes>
