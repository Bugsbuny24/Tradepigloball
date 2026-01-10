import { useEffect, useState } from "react";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/printify-products")
      .then(res => res.json())
      .then(data => {
        setProducts(data || []);
        setLoading(false);
      });
  }, []);

  if (loading) return <p style={{ padding: 20 }}>Yükleniyor...</p>;

  return (
    <div style={{ padding: 20 }}>
      <h1>Products</h1>

      {products.length === 0 && <p>Ürün yok</p>}

      <div style={{ display: "grid", gap: 20 }}>
        {products.map(p => (
          <div key={p.id} style={{ border: "1px solid #ddd", padding: 10 }}>
            <h3>{p.title}</h3>
            {p.images?.[0] && (
              <img
                src={p.images[0].src}
                alt={p.title}
                width="200"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
