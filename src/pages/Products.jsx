import React from "react";

export default function Products() {
  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Products</h1>
      <p style={{ opacity: 0.85 }}>
        Buraya ürün listesi gelecek. Ürün ekleme ise “paid action” olacak (Pi ile).
      </p>

      <div style={box}>
        <b>TODO</b>
        <ul style={{ marginTop: 8, opacity: 0.9 }}>
          <li>Supabase: products tablosu</li>
          <li>Public read</li>
          <li>Create product = Pi ücretli</li>
        </ul>
      </div>
    </div>
  );
}

const box = {
  marginTop: 12,
  padding: 14,
  borderRadius: 14,
  background: "rgba(255,255,255,.06)",
  border: "1px solid rgba(255,255,255,.10)",
};
