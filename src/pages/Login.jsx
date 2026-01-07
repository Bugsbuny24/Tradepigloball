import React from "react";
import { supabase } from "../lib/supabase";

export default function Login() {
  const [email, setEmail] = React.useState("");
  const [pass, setPass] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [user, setUser] = React.useState(null);

  React.useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data?.user ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    return () => sub?.subscription?.unsubscribe?.();
  }, []);

  async function onLogin(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password: pass,
      });
      if (error) throw error;
      alert("Login ✅");
    } catch (err) {
      alert(err.message || "Login error");
    } finally {
      setLoading(false);
    }
  }

  async function onSignup(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password: pass,
      });
      if (error) throw error;
      alert("Signup ✅ (mail confirm gerekebilir)");
    } catch (err) {
      alert(err.message || "Signup error");
    } finally {
      setLoading(false);
    }
  }

  async function onLogout() {
    await supabase.auth.signOut();
    alert("Logout ✅");
  }

  return (
    <div>
      <h2 style={{ marginTop: 0 }}>Login</h2>

      {user ? (
        <div style={{ display: "grid", gap: 10 }}>
          <div style={{ opacity: 0.85, fontSize: 13 }}>
            Logged in as: <b>{user.email}</b>
          </div>
          <button
            onClick={onLogout}
            style={{
              padding: "10px 12px",
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,.12)",
              background: "rgba(255,255,255,.08)",
              color: "white",
              cursor: "pointer",
              width: "fit-content",
            }}
          >
            Logout
          </button>
        </div>
      ) : (
        <form onSubmit={onLogin} style={{ display: "grid", gap: 10, maxWidth: 420 }}>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email"
            style={inp}
          />
          <input
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            placeholder="password"
            type="password"
            style={inp}
          />
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button type="submit" disabled={loading} style={btn}>
              Login
            </button>
            <button onClick={onSignup} disabled={loading} style={btnAlt}>
              Signup
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

const inp = {
  padding: "12px 12px",
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,.12)",
  background: "rgba(0,0,0,.18)",
  color: "white",
  outline: "none",
};

const btn = {
  padding: "10px 12px",
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,.12)",
  background: "rgba(130,90,255,.45)",
  color: "white",
  cursor: "pointer",
};

const btnAlt = {
  ...btn,
  background: "rgba(255,255,255,.08)",
};
