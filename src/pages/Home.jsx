import React from "react";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Home</h1>
      <p style={{ opacity: 0.85, lineHeight: 1.5 }}>
        Reset tamam ✅ Şimdi hedefimiz: herkes user (buyer+seller), üyelik ücretsiz.
        Ücretli olanlar: ürün ekleme / RFQ açma / vitrin öne çıkarma (Pi ile).
      </p>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 12 }}>
        <LinkButton to="/products">Products</LinkButton>
        <LinkButton to="/rfqs">RFQs</LinkButton>
        <LinkButton to="/login">Login</LinkButton>
      </div>
    </div>
  );
}

function LinkButton({ to, children }) {
  return (
    <Link
      to={to}
      style={{
        display: "inline-block",
        padding: "10px 14px",
        borderRadius: 14,
        background: "rgba(130,90,255,.35)",
        border: "1px solid rgba(255,255,255,.12)",
        color: "white",
        textDecoration: "none",
        fontWeight: 700,
      }}
    >
      {children}
    </Link>
  );
}
