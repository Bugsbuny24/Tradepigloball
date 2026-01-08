import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import NavBar from "./components/NavBar";

import Home from "./pages/Home";
import Login from "./pages/Login";

import RFQs from "./pages/RFQs";
import RFQDetail from "./pages/RFQDetail";

import Orders from "./pages/Orders";
import OrderDetail from "./pages/OrderDetail";

import PiPayment from "./pages/PiPayment";

import Products from "./pages/Products";
import Store from "./pages/Store";
import Stand from "./pages/Stand";

import Credits from "./pages/Credits"; // ✅ DÜZELTİLDİ (lib değil, page)

export default function App() {
  return (
    <>
      <NavBar />
      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/login" element={<Login />} />

        {/* RFQ */}
        <Route path="/rfqs" element={<RFQs />} />
        <Route path="/rfqs/:id" element={<RFQDetail />} />

        {/* Orders */}
        <Route path="/orders" element={<Orders />} />
        <Route path="/orders/:id" element={<OrderDetail />} />

        {/* Pi Payment */}
        <Route path="/pi/payment/:orderId" element={<PiPayment />} />

        {/* Products */}
        <Route path="/pi/products" element={<Products />} />
        <Route path="/store" element={<Store />} />
        <Route path="/stand/:slug" element={<Stand />} />

        {/* Credits */}
        <Route path="/credits" element={<Credits />} />

        {/* fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
