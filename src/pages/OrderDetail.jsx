import React from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = React.useState(null);

  async function load() {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (!error) setOrder(data || null);
  }

  React.useEffect(() => {
    load();
  }, [id]);

  if (!order) return <div style={{ padding: 16 }}>Loading...</div>;

  return (
    <div style={{ padding: 16 }}>
      <h2>Order Detail</h2>

      <div style={card}>
        <div><b>ID:</b> {order.id}</div>
        <div><b>Status:</b> {order.status}</div>
        {order.buyer_id ? <div><b>Buyer:</b> {order.buyer_id}</div> : null}
        {order.seller_id ? <div><b>Seller:</b> {order.seller_id}</div> : null}
      </div>

      <Link to={`/pi/payment/${order.id}`} style={{ textDecoration: "none" }}>
        <button style={btn}>Pay with Pi</button>
      </Link>
    </div>
  );
}

const card = {
  padding: 12,
  borderRadius: 12,
  background: "rgba(0,0,0,.18)",
  border: "1px solid rgba(255,255,255,.08)",
  marginBottom: 12,
};
const btn = {
  padding: "12px 16px",
  borderRadius: 12,
  border: "none",
  background: "#6d5cff",
  color: "white",
  fontWeight: 900,
  cursor: "pointer",
};
