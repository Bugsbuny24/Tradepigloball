import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../supabaseClient";

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchOrder();
    // eslint-disable-next-line
  }, [id]);

  async function fetchOrder() {
    setLoading(true);
    setError("");

    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      setError(error.message);
    } else {
      setOrder(data);
    }
    setLoading(false);
  }

  if (loading) return <p>Loading order...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!order) return <p>Order not found</p>;

  return (
    <div style={{ maxWidth: 700, margin: "0 auto" }}>
      <Link to="/orders">← Back to Orders</Link>

      <h1>Order Detail</h1>

      <div style={box}>
        <Row label="Order ID" value={order.id} />
        <Row label="Status" value={order.status} />
        <Row label="Buyer ID" value={order.buyer_id} />
        <Row label="Seller ID" value={order.seller_id} />
        <Row label="Created At" value={new Date(order.created_at).toLocaleString()} />
      </div>

      {/* İleride */}
      {/* - ödeme */}
      {/* - kargo */}
      {/* - dispute */}
      {/* - teslim onayı */}
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div style={{ display: "flex", marginBottom: 8 }}>
      <strong style={{ width: 120 }}>{label}:</strong>
      <span>{value}</span>
    </div>
  );
}

const box = {
  marginTop: 16,
  padding: 16,
  borderRadius: 8,
  background: "#f4f4f4",
};
