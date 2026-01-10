import { Routes, Route, Navigate } from "react-router-dom";
import NavBar from "./components/NavBar";

import Home from "./pages/Home";
import Products from "./pages/Products";
import Login from "./pages/Login";


export default function App() {
  return (
    <>
      <NavBar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
