import React from "react";

export default function Login() {
  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Login</h1>
      <p style={{ opacity: 0.85 }}>
        Buraya bir sonraki adımda Supabase Auth ekleyeceğiz. Şimdilik placeholder.
      </p>

      <div style={{ display: "grid", gap: 10, maxWidth: 360 }}>
        <input placeholder="email" style={inp} />
        <input placeholder="password" type="password" style={inp} />
        <button style={btn} disabled>
          Login (soon)
        </button>
      </div>
    </div>
  );
}

const inp = {
  padding: "10px 12px",
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,.14)",
  background: "rgba(0,0,0,.25)",
  color: "white",
  outline: "none",
};

const btn = {
  padding: "10px 12px",
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,.14)",
  background: "rgba(255,255,255,.08)",
  color: "white",
  fontWeight: 800,
  cursor: "not-allowed",
  opacity: 0.7,
};
