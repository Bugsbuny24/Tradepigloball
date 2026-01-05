import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async () => {
    setBusy(true);
    const { error } = await supabase.auth.signUp({ email, password });
    setBusy(false);

    if (error) return alert(error.message);

    // Email confirmation açıksa kullanıcı mail onayı bekler.
    alert("Kayıt OK. Eğer email confirmation açıksa mailini kontrol et.");
    navigate("/login", { replace: true });
  };

  return (
    <div style={{ padding: 24 }}>
      <h1>Register</h1>

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

      <button onClick={handleRegister} disabled={busy}>
        {busy ? "..." : "Kayıt Ol"}
      </button>

      <div style={{ marginTop: 12 }}>
        Hesabın var mı? <Link to="/login">Giriş</Link>
      </div>
    </div>
  );
}
