import React from "react";
import { BrowserRouter, Routes, Route, Link, Navigate } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Products from "./pages/Products";
import RFQs from "./pages/RFQs";

/** Tiny placeholder page (tek dosya - hızlı iskelet) */
const Page = ({ title, children }) => (
  <div style={{ padding: 18 }}>
    <h2 style={{ marginTop: 0 }}>{title}</h2>
    {children ? (
      <div>{children}</div>
    ) : (
      <p style={{ opacity: 0.75, marginTop: 8 }}>Coming soon.</p>
    )}
  </div>
);

/** Footer – her sayfada sabit GLOBAL DISCLAIMER */
function GlobalDisclaimer() {
  return (
    <div
      style={{
        marginTop: 18,
        paddingTop: 12,
        borderTop: "1px solid rgba(255,255,255,.10)",
        fontSize: 12,
        opacity: 0.85,
        lineHeight: 1.35,
      }}
    >
      TradePiGloball is a showroom and RFQ platform only. We are not a party to
      any transaction, payment, delivery, refund, or dispute. All agreements and
      liabilities belong solely to buyers and sellers.
    </div>
  );
}

const layout = {
  minHeight: "100vh",
  background:
    "radial-gradient(circle at 20% 10%, rgba(130,90,255,.25), transparent 40%), radial-gradient(circle at 70% 0%, rgba(60,190,255,.18), transparent 45%), linear-gradient(180deg, rgba(12,12,24,1), rgba(7,10,18,1))",
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
          {/* Top Bar */}
          <div style={nav}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 12,
                  background: "rgba(130,90,255,.35)",
                  display: "grid",
                  placeItems: "center",
                  fontWeight: 800,
                }}
                title="TradePiGloball"
              >
                π
              </div>
              <div>
                <div style={{ fontWeight: 800, letterSpacing: 0.2 }}>
                  TradePiGloball
                </div>
                <div style={{ fontSize: 12, opacity: 0.75 }}>
                  PI MODE • showroom + RFQ
                </div>
              </div>
            </div>

            {/* Nav Links */}
            <div style={navLinks}>
              <Link to="/" style={aStyle}>
                Home
              </Link>
              <Link to="/login" style={aStyle}>
                Login
              </Link>
              <Link to="/products" style={aStyle}>
                Products
              </Link>
              <Link to="/rfqs" style={aStyle}>
                RFQs
              </Link>

              {/* Money Pages */}
              <Link to="/services" style={aStyle}>
                Services
              </Link>
              <Link to="/templates" style={aStyle}>
                Templates
              </Link>
              <Link to="/leads" style={aStyle}>
                Leads
              </Link>
              <Link to="/tools" style={aStyle}>
                Tools
              </Link>
            </div>
          </div>

          {/* Main Card */}
          <div style={card}>
            <Routes>
              {/* Core */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/products" element={<Products />} />
              <Route path="/rfqs" element={<RFQs />} />
              <Route path="/offers" element={<Page title="Offers" />} />

              {/* Money Pages */}
              <Route
                path="/services"
                element={<Page title="Verified Services Marketplace" />}
              />
              <Route path="/leads" element={<Page title="RFQ → Lead Engine" />} />
              <Route
                path="/templates"
                element={<Page title="Trade Templates" />}
              />
              <Route
                path="/assets"
                element={<Page title="Digital Trade Assets" />}
              />
              <Route
                path="/education"
                element={<Page title="Trade Education" />}
              />
              <Route path="/tools" element={<Page title="Mini Trade Tools" />} />
              <Route
                path="/spotlight"
                element={<Page title="Trade Spotlight" />}
              />

              {/* Sales Pages */}
              <Route
                path="/sell/mobile-app"
                element={<Page title="Mobile App Sales Page" />}
              />
              <Route
                path="/sell/website"
                element={<Page title="Website Sales Page" />}
              />
              <Route
                path="/sell/fiverr"
                element={<Page title="Fiverr Services Page" />}
              />

              {/* fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>

            <GlobalDisclaimer />
          </div>

          <div style={{ marginTop: 14, fontSize: 12, opacity: 0.65 }}>
            Not: Şimdilik sadece iskelet. Sonraki adımda “pi ile ücretli aksiyon”
            (product upload / RFQ create / spotlight) modelini ekleriz.
          </div>
        </div>
      </div>
    </BrowserRouter>
  );
}
