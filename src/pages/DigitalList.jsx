import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { Link } from "react-router-dom";

export default function DigitalList() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("digital_products")
        .select("id,title,price_pi,created_at")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      setItems(data ?? []);
    })();
  }, []);

  return (
    <div style={{ padding: 16 }}>
      <h2>Digital Products</h2>
      <Link to="/digital/new">+ New</Link>
      <div style={{ marginTop: 12 }}>
        {items.map(p => (
          <div key={p.id} style={{ padding: 12, border: "1px solid #ddd", marginBottom: 8 }}>
            <div><b>{p.title}</b></div>
            <div>{p.price_pi} PI</div>
            <Link to={`/digital/${p.id}`}>Open</Link>
          </div>
        ))}
      </div>
    </div>
  );
}
