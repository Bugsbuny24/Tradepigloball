import React, { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../lib/auth";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const { user, loading } = useAuth();
  const nav = useNavigate();

  const [mode, setMode] = useState("login"); // login | signup
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setErr("");
    setMsg("");
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({ email, password: pass });
        if (error) throw error;
        setMsg("Kayıt tamam. Mail doğrulaması istenebilir. Sonra giriş yap.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
        if (error) throw error;
        nav("/");
      }
    } catch (e2) {
      setErr(e2?.message || "Error");
    } finally {
      setBusy(false);
    }
  }

  async function logout() {
    await supabase.auth.signOut();
  }

  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Login</h1>

      {loading ? <div style={{ opacity: 0.8 }}>Loading...</div> : null}

      {user ? (
        <div style={box}>
          <div style={{ fontWeight: 800 }}>Giriş yapıldı ✅</div>
          <div style={{ opacity: 0.8, marginTop: 6, wordBreak: "break-word" }}>
            {user.email} <br />
            <small>uid: {user.id}</small>
          </div>
          <button onClick={logout} style={{ ...btn, marginTop: 12 }}>
            Logout
          </button>
        </div>
      ) : (
        <>
          <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
            <button onClick={() => setMode("login")} style={modeBtn(mode === "login")}>Login</button>
            <button onClick={() => setMode("signup")} style={modeBtn(mode === "signup")}>Sign up</button>
          </div>

          <form onSubmit={submit} style={{ display: "grid", gap: 10, maxWidth: 360 }}>
            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email" style={inp} />
            <input value={pass} onChange={(e) => setPass(e.target.value)} placeholder="password" type="password" style={inp} />
            <button style={btn} disabled={busy || !email || !pass}>
              {busy ? "..." : mode === "signup" ? "Create account" : "Login"}
            </button>
          </form>

          {msg ? <div style={{ marginTop: 12, color: "rgba(180,255,180,.95)" }}>{msg}</div> : null}
          {err ? <div style={{ marginTop: 12, color: "rgba(255,180,180,.95)" }}>{err}</div> : null}
        </>
      )}
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
  background: "rgba(130,90,255,.35)",
  color: "white",
  fontWeight: 800,
  cursor: "pointer",
};

function modeBtn(active) {
  return {
    padding: "8px 12px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,.12)",
    background: active ? "rgba(255,255,255,.10)" : "rgba(0,0,0,.20)",
    color: "white",
    cursor: "pointer",
    fontWeight: 700,
  };
}
