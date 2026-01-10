import { useEffect, useMemo, useState } from "react";
import { getCart } from "../lib/cart";

export default function Checkout() {
  const cart = getCart();
  const total = useMemo(() => cart.reduce((s,x)=>s + x.priceTRY*x.qty,0), [cart]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const pay = async () => {
    setLoading(true);
    setErr("");
    try {
      const r = await fetch("/api/iyzico/initialize", {
        method: "POST",
        headers: { "Content-Type":"application/json" },
        body: JSON.stringify({ cart, total })
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data?.error || "Payment init failed");

      // iyzico checkout form (html) döndürüyoruz -> ekrana basacağız
      document.open();
      document.write(data.checkoutFormContent);
      document.close();
    } catch (e) {
      setErr(e.message || "Hata");
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!cart.length) setErr("Sepet boş.");
  }, []);

  return (
    <div style={{ padding: 24 }}>
      <h1>Checkout</h1>
      <p>Toplam: ₺{total}</p>
      {err && <p style={{ color:"crimson" }}>{err}</p>}
      <button disabled={loading || !cart.length} onClick={pay}>
        {loading ? "Başlatılıyor..." : "iyzico ile Öde"}
      </button>
    </div>
  );
}
