import React from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export default function Orders() {
  const [items, setItems] = React.useState([]);

  async function load() {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    if (!error) setItems(data || []);
  }

  React.useEffect(() => {
    load();
  }, []);

  return (
    <div style={{ padding: 16 }}>
      <h2>Orders</h2>

      {items.length ? (
        <div style={{ display: "grid", gap: 10 }}>
          {items.map((o) => (
            <Link
              key={o.id}
              to={`/orders/${o.id}`}
              style={{ textDecoration: "none", color: "white" }}
            >
              <div style={card}>
                <div><b>status:</b> {o.status}</div>
                <div style={{ opacity: 0.8 }}><b>id:</b> {o.id}</div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div style={{ opacity: 0.8 }}>No orders yet.</div>
      )}
    </div>
  );
}

const card = {
  padding: 12,
  borderRadius: 12,
  background: "rgba(0,0,0,.18)",
  border: "1px solid rgba(255,255,255,.08)",
};
