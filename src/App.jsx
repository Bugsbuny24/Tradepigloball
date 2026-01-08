import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Products from "./pages/Products";
import RFQs from "./pages/RFQs";
import RFQDetail from "./pages/RFQDetail";
import OrderDetail from "./pages/OrderDetail";
import Orders from "./pages/Orders";
import PiPayment from "./pages/PiPayment";
import Admin from "./pages/Admin";
import Profile from "./pages/Profile";

export default function App() {
  return (
    <Router>
      <div style={nav}>
        <Link style={a} to="/">Home</Link>
        <Link style={a} to="/login">Login</Link>
        <Link style={a} to="/products">Products</Link>
        <Link style={a} to="/rfqs">RFQs</Link>
        <Link style={a} to="/orders">Orders</Link>
        <Link style={a} to="/profile">Profile</Link>
        <Link style={a} to="/admin">Admin</Link>
      </div>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />

        <Route path="/products" element={<Products />} />
        <Route path="/rfqs" element={<RFQs />} />
        <Route path="/rfqs/:id" element={<RFQDetail />} />

        <Route path="/orders" element={<Orders />} />
        <Route path="/orders/:id" element={<OrderDetail />} />

        <Route path="/pi/payment/:orderId" element={<PiPayment />} />

        <Route path="/profile" element={<Profile />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </Router>
  );
}

const nav = {
  display: "flex",
  gap: 12,
  padding: 12,
  flexWrap: "wrap",
  background: "rgba(0,0,0,.25)",
  borderBottom: "1px solid rgba(255,255,255,.08)",
};
const a = { color: "white", textDecoration: "none", opacity: 0.95 };
