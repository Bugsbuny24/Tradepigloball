import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProtectedRoute from "./components/ProtectedRoute";
import RequireRole from "./components/RequireRole";
import PiRfqs from "./pages/PiRfqs";
import PiRfqDetail from "./pages/PiRfqDetail";
import PiProducts from "./pages/PiProducts";
import CreateRfq from "./pages/CreateRfq";
import ExpoCity from "./pages/ExpoCity";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />

      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* PI MODE (login şart) */}
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

      {/* Expo City (istersen login zorunlu yaparız) */}
      <Route path="/expo-city" element={<ExpoCity />} />

      {/* örnek admin sayfası */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <RequireRole allow={["owner", "admin"]}>
              <div style={{ padding: 24 }}>Admin Panel</div>
            </RequireRole>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
