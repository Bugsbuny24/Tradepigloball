import { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || "/";

  const handleLogin = async () => {
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);

    if (error) return alert(error.message);

    // login ok -> geldiği sayfaya dön
    navigate(from, { replace: true });
  };

  return (
    <div style={{ padding: 24 }}>
      <h1>Login</h1>

      <input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ display: "block", marginBottom: 12, width: "100%" }}
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{ display: "block", marginBottom: 12, width: "100%" }}
      />

      <button onClick={handleLogin} disabled={busy}>
        {busy ? "..." : "Giriş Yap"}
      </button>

      <div style={{ marginTop: 12 }}>
        Hesabın yok mu? <Link to="/register">Kayıt Ol</Link>
      </div>
    </div>
  );
}
