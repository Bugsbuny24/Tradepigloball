import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export default function SellerSignup() {
  const nav = useNavigate();
  const [loading, setLoading] = useState(false);

  async function onSignup(e) {
    e.preventDefault();
    setLoading(true);

    const email = e.target.email.value.trim();
    const password = e.target.password.value;

    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      setLoading(false);
      alert(error.message);
      return;
    }

    setLoading(false);
    nav("/seller/waiting");
  }

  return (
    <div style={{ maxWidth: 420, margin: "40px auto", padding: 16 }}>
      <h2>Seller Kayıt</h2>
      <form onSubmit={onSignup} style={{ display:"grid", gap:10 }}>
        <input name="email" type="email" placeholder="Email" required />
        <input name="password" type="password" placeholder="Şifre" required />
        <button disabled={loading} type="submit">
          {loading ? "Oluşturuluyor..." : "Seller hesabı oluştur"}
        </button>
      </form>
      <p style={{ marginTop: 12, opacity: 0.8 }}>
        Not: Seller hesabı açılır. Şirket yetkisi admin tarafından verilir.
      </p>
    </div>
  );
}
