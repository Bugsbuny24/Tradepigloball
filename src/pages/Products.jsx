import { useEffect, useState } from "react";
import { fetchPrintifyProducts } from "../lib/api";
import { addToCart, getCart } from "../lib/cart";
import { Link } from "react-router-dom";

export default function Products() {
  const [data, setData] = useState([]);
  const [err, setErr] = useState("");
  const [cartCount, setCartCount] = useState(getCart().reduce((a,b)=>a+b.qty,0));

  useEffect(() => {
    (async () => {
      try {
        const r = await fetchPrintifyProducts();
        setData(r.data || []);
      } catch (e) {
        setErr(e.message || "Hata");
      }
    })();
  }, []);

  const onAdd = (p) => {
    // Printify product model: id, title, images...
    const image = (p.images && p.images[0] && p.images[0].src) || "";
    addToCart({
      id: p.id,
      title: p.title,
      image,
      // fiyatı şimdilik sen belirle: (istersen variant price çekeriz)
      priceTRY: 599
    });
    setCartCount(getCart().reduce((a,b)=>a+b.qty,0));
  };

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <h1>Products</h1>
        <Link to="/cart">Cart ({cartCount})</Link>
      </div>

      {err && <p style={{ color:"crimson" }}>{err}</p>}

      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(220px, 1fr))", gap:16 }}>
        {data.map(p => (
          <div key={p.id} style={{ border:"1px solid #ddd", padding:12 }}>
            {p.images?.[0]?.src && (
              <img src={p.images[0].src} alt={p.title} style={{ width:"100%", height:160, objectFit:"contain" }} />
            )}
            <div style={{ fontWeight:"bold", marginTop:8 }}>{p.title}</div>
            <div style={{ margin:"8px 0" }}>₺599</div>
            <button onClick={() => onAdd(p)}>Sepete Ekle</button>
          </div>
        ))}
      </div>
    </div>
  );
}
