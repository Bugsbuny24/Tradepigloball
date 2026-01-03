import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { getBuyerProfile, getMyCompany } from "../lib/session";

export default function Login() {
  const nav = useNavigate();
  const [sp] = useSearchParams();
  const as = sp.get("as"); // buyer/seller/null
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Zaten login ise yönlendir
    supabase.auth.getSession().then(async ({ data }) => {
      const s = data.session;
      if (!s?.user) return;
      await routeByRole(s.user.id);
    });
    // eslint-disable-next-line
  }, []);

  async function routeByRole(uid) {
    // Eğer ?as=buyer diyorsa buyer kontrol et
    if (as === "buyer") {
      const buyer = await getBuyerProfile(uid);
      if (buyer) return nav("/buyer");
      return nav("/buyer/signup"); // buyer profili yoksa kayıt
    }

    if (as === "seller") {
      const res = await getMyCompany();
      if (res?.has_company) return nav("/seller");
      return nav("/seller/waiting");
    }

    // as yoksa otomatik karar:
    // önce company var mı bak (seller), yoksa buyer var mı bak
    const res = await getMyCompany().catch(() => null);
    if (res?.has_company) return nav("/seller");

    const buyer = await getBuyerProfile(uid).catch(() => null);
    if (buyer) return nav("/buyer");

    // hiçbir şey yoksa landing
    return nav("/");
  }

  async function onLogin(e) {
    e.preventDefault();
    setLoading(true);

    const email = e.target.email.value.trim();
    const password = e.target.password.value;

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setLoading(false);
      alert(error.message);
      return;
    }

    await routeByRole(data.user.id);
    setLoading(false);
  }

  return (
    <div style={{ maxWidth: 420, margin: "40px auto", padding: 16 }}>
      <h2>Giriş</h2>
      <form onSubmit={onLogin} style={{ display:"grid", gap:10 }}>
        <input name="email" type="email" placeholder="Email" required />
        <input name="password" type="password" placeholder="Şifre" required />
        <button disabled={loading} type="submit">
          {loading ? "Giriş..." : "Giriş yap"}
        </button>
      </form>

      <div style={{ marginTop: 16, display:"flex", gap:10, flexWrap:"wrap" }}>
        <button onClick={() => nav("/buyer/signup")}>Buyer Kayıt</button>
        <button onClick={() => nav("/seller/signup")}>Seller Kayıt</button>
      </div>
    </div>
  );
}
