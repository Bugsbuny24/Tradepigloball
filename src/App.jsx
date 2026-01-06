import React from "react";
import { BrowserRouter, Routes, Route, Link, Navigate } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Products from "./pages/Products";
import RFQs from "./pages/RFQs";

const layout = {
  minHeight: "100vh",
  background: "radial-gradient(circle at 20% 10%, rgba(130,90,255,.25), transparent 40%), radial-gradient(circle at 70% 30%, rgba(0,200,255,.18), transparent 45%), #070A12",
  color: "white",
  fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial",
};

const shell = {
  maxWidth: 980,
  margin: "0 auto",
  padding: 16,
};

const card = {
  background: "rgba(255,255,255,.06)",
  border: "1px solid rgba(255,255,255,.10)",
  borderRadius: 16,
  padding: 16,
  boxShadow: "0 10px 30px rgba(0,0,0,.25)",
};

const nav = {
  display: "flex",
  gap: 10,
  flexWrap: "wrap",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: 14,
};

const navLinks = {
  display: "flex",
  gap: 10,
  flexWrap: "wrap",
};

const aStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  padding: "8px 12px",
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,.12)",
  background: "rgba(0,0,0,.22)",
  color: "white",
  textDecoration: "none",
};

export default function App() {
  return (
    <BrowserRouter>
      <div style={layout}>
        <div style={shell}>
          <div style={nav}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: 12, background: "rgba(130,90,255,.35)", display: "grid", placeItems: "center", border: "1px solid rgba(255,255,255,.10)" }}>
                π
              </div>
              <div>
                <div style={{ fontWeight: 800, letterSpacing: 0.2 }}>TradePiGloball</div>
                <div style={{ fontSize: 12, opacity: 0.75 }}>Clean reset • MVP shell</div>
              </div>
            </div>

            <div style={navLinks}>
              <Link to="/" style={aStyle}>Home</Link>
              <Link to="/login" style={aStyle}>Login</Link>
              <Link to="/products" style={aStyle}>Products</Link>
              <Link to="/rfqs" style={aStyle}>RFQs</Link>
            </div>
          </div>

          <div style={card}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/products" element={<Products />} />
              <Route path="/rfqs" element={<RFQs />} />

              {/* fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>

          <div style={{ marginTop: 14, fontSize: 12, opacity: 0.65 }}>
            Not: Şimdilik sadece iskelet. Bir sonraki adımda Supabase login + “paid actions” modeli ekleyeceğiz.
          </div>
        </div>
      </div>
    </BrowserRouter>
  );
      }
