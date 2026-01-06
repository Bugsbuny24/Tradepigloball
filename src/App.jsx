export default function App() {
  return (
    <Routes>
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

      {/* PI RFQs */}
      <Route
        path="/pi/rfqs"
        element={
          <ProtectedRoute>
            <PiRfqs />
          </ProtectedRoute>
        }
      />

      <Route
        path="/pi/rfqs/:id"
        element={
          <ProtectedRoute>
            <PiRfqDetail />
          </ProtectedRoute>
        }
      />

      {/* Expo City */}
      <Route path="/expo-city" element={<ExpoCity />} />

      {/* Admin */}
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
