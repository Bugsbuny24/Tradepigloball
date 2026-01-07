import React from "react";
import { supabase } from "../lib/supabase";
import { creditSpend, CREDIT_COST } from "../lib/credits";

export default function Products() {
  const [title, setTitle] = React.useState("");
  const [price, setPrice] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [items, setItems] = React.useState([]);

  async function load() {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);
    if (!error) setItems(data || []);
  }

  React.useEffect(() => {
    load();
  }, []);

  async function onCreateProduct() {
    setLoading(true);
    try {
      await creditSpend("PRODUCT_CREATE", CREDIT_COST.PRODUCT_CREATE, "Create Product");

      const { error } = await supabase.from("products").insert({
        title: title || "Demo Product",
        price: Number(price || 0),
      });
      if (error) throw error;

      alert("Product added ✅");
      setTitle("");
      setPrice("");
      await load();
    } catch (e) {
      if (e?.code === "YETERSIZ_KREDI") return alert("Kredi bitti kanka 😅 Ürün eklemek için kredi lazım.");
      if (e?.code === "NOT_AUTHENTICATED") return alert("Önce Login ol kanka.");
      alert(e?.message || "Hata");
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h2 style={{ marginTop: 0 }}>Products</h2>
      <div style={{ opacity: 0.8, marginBottom: 12 }}>
        Ürün eklemek <b>1 kredi</b> yer.
      </div>

      <div style={{ display: "grid", gap: 10, maxWidth: 420 }}>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" style={inp} />
        <input value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Price (number)" style={inp} />

        <button onClick={onCreateProduct} disabled={loading} style={btn}>
          {loading ? "Working..." : "Create Product (1 credit)"}
        </button>
      </div>

      <div style={{ marginTop: 18 }}>
        {items?.length ? (
          <div style={{ display: "grid", gap: 10 }}>
            {items.map((x) => (
              <div key={x.id} style={card}>
                <div style={{ fontWeight: 800 }}>{x.title}</div>
                <div style={{ opacity: 0.8 }}>Price: {x.price}</div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ opacity: 0.8 }}>No products yet.</div>
        )}
      </div>
    </div>
  );
}

const inp = {
  padding: "12px 12px",
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,.12)",
  background: "rgba(0,0,0,.18)",
  color: "white",
  outline: "none",
};
const btn = {
  padding: "12px 12px",
  borderRadius: 14,
  border: "1px solid rgba(255,255,255,.12)",
  background: "rgba(130,90,255,.45)",
  color: "white",
  cursor: "pointer",
  fontWeight: 800,
};
const card = {
  padding: 12,
  borderRadius: 14,
  border: "1px solid rgba(255,255,255,.10)",
  background: "rgba(0,0,0,.14)",
};
