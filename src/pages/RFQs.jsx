import React from "react";

export default function RFQs() {
  return (
    <div>
      <h1 style={{ marginTop: 0 }}>RFQs</h1>
      <p style={{ opacity: 0.85 }}>
        Buraya RFQ listesi gelecek. RFQ açma da “paid action” olacak (Pi ile).
      </p>

      <div style={box}>
        <b>TODO</b>
        <ul style={{ marginTop: 8, opacity: 0.9 }}>
          <li>Supabase: rfqs tablosu</li>
          <li>Public read</li>
          <li>Create RFQ = Pi ücretli</li>
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
