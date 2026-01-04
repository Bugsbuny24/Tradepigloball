import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export default function BuyerSignup() {
  const nav = useNavigate();
  const [loading, setLoading] = useState(false);

  async function onSignup(e) {
    e.preventDefault();
    setLoading(true);

    const email = e.target.email.value.trim();
    const password = e.target.password.value;
    const full_name = e.target.full_name.value.trim() || null;
    const country = e.target.country.value.trim() || null;

    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      setLoading(false);
      alert(error.message);
      return;
    }

    const uid = data.user?.id;
    if (!uid) {
      setLoading(false);
      alert("Signup başarılı ama user id alınamadı.");
      return;
    }

    // buyers insert
    const { error: insErr } = await supabase.from("buyers").insert({
  uid,          // ✅ RLS bununla geçer
  email,
  full_name,
  country,
});

    if (insErr) {
      setLoading(false);
      alert(insErr.message);
      return;
    }

    setLoading(false);
    nav("/buyer");
  }

  return (
    <div style={{ maxWidth: 520, margin: "40px auto", padding: 16 }}>
      <h2>Buyer Kayıt</h2>
      <form onSubmit={onSignup} style={{ display:"grid", gap:10 }}>
        <input name="email" type="email" placeholder="Email" required />
        <input name="password" type="password" placeholder="Şifre" required />
        <input name="full_name" type="text" placeholder="Ad Soyad (opsiyonel)" />
        <input name="country" type="text" placeholder="Ülke (opsiyonel)" />
        <button disabled={loading} type="submit">
          {loading ? "Oluşturuluyor..." : "Buyer hesabı oluştur"}
        </button>
      </form>
    </div>
  );
}
