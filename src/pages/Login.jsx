import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export default function Login() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setErr("");

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErr(error.message);
      return;
    }

    // session geldi mi garanti kontrol
    const s = data?.session;
    if (!s) {
      setErr("Email doğrulaması gerekebilir. Mailini kontrol et.");
      return;
    }

    nav("/pi/products", { replace: true });
  };

  return (
    <form onSubmit={handleLogin}>
      <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
      <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" type="password" />
      <button type="submit">Giriş Yap</button>
      {err && <p style={{ marginTop: 10 }}>{err}</p>}
    </form>
  );
}
