import { useMemo, useState } from "react";
import { getCart, removeFromCart, clearCart } from "../lib/cart";
import { Link, useNavigate } from "react-router-dom";

export default function Cart() {
  const nav = useNavigate();
  const [items, setItems] = useState(getCart());

  const total = useMemo(
    () => items.reduce((sum, x) => sum + (x.priceTRY * x.qty), 0),
    [items]
  );

  const del = (id) => setItems(removeFromCart(id));

  return (
    <div style={{ padding: 24 }}>
      <h1>Cart</h1>

      {!items.length && (
        <>
          <p>Sepet boş.</p>
          <Link to="/products">Ürünlere dön</Link>
        </>
      )}

      {items.map(x => (
        <div key={x.id} style={{ display:"flex", gap:12, borderBottom:"1px solid #eee", padding:"12px 0" }}>
          {x.image && <img src={x.image} alt={x.title} width="60" />}
          <div style={{ flex:1 }}>
            <div><b>{x.title}</b></div>
            <div>₺{x.priceTRY} × {x.qty}</div>
          </div>
          <button onClick={() => del(x.id)}>Sil</button>
        </div>
      ))}

      {!!items.length && (
        <>
          <h3 style={{ marginTop: 16 }}>Toplam: ₺{total}</h3>
          <div style={{ display:"flex", gap:12 }}>
            <button onClick={() => { clearCart(); setItems([]); }}>Sepeti Temizle</button>
            <button onClick={() => nav("/checkout")}>Ödemeye Geç</button>
          </div>
        </>
      )}
    </div>
  );
}
