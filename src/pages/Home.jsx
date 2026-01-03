import { useNavigate } from "react-router-dom";

export default function Home() {
  const nav = useNavigate();

  return (
    <div style={{ maxWidth: 520, margin: "40px auto", padding: 16 }}>
      <h1>TradePiGloball</h1>
      <p>B2B Showroom</p>

      <div style={{ display:"grid", gap:12, marginTop:24 }}>
        <button style={{ padding: 14 }} onClick={() => nav("/login?as=buyer")}>
          Buyer Giriş
        </button>
        <button style={{ padding: 14 }} onClick={() => nav("/buyer/signup")}>
          Buyer Kayıt
        </button>

        <hr />

        <button style={{ padding: 14 }} onClick={() => nav("/login?as=seller")}>
          Seller Giriş
        </button>
        <button style={{ padding: 14 }} onClick={() => nav("/seller/signup")}>
          Seller Kayıt
        </button>
      </div>
    </div>
  );
}
