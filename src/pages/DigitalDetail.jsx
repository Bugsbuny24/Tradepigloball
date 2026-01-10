import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useParams } from "react-router-dom";

export default function DigitalDetail() {
  const { id } = useParams();
  const [p, setP] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("digital_products")
        .select("id,title,description,price_pi,is_active")
        .eq("id", id)
        .single();
      if (!error) setP(data);
    })();
  }, [id]);

  async function buyWithPi() {
    setBusy(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Login required");

      // Pi SDK global (Pi Browser)
      if (!window.Pi) throw new Error("Pi SDK not found (Pi Browser required)");

      // 1) Create Pi payment on client
      const payment = await window.Pi.createPayment({
        amount: Number(p.price_pi),
        memo: `Buy digital product: ${p.title}`,
        metadata: { product_id: p.id },
      });

      // payment.identifier -> send to backend confirm
      const confirmRes = await fetch(`${import.meta.env.VITE_SUPABASE_FUNCTIONS_URL}/confirm-purchase`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ product_id: p.id, payment_identifier: payment.identifier }),
      });

      const confirmJson = await confirmRes.json();
      if (!confirmRes.ok) throw new Error(confirmJson.reason || confirmJson.error || "Confirm failed");

      // 2) Get signed download URL
      const dlRes = await fetch(`${import.meta.env.VITE_SUPABASE_FUNCTIONS_URL}/get-download`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ product_id: p.id }),
      });

      const dlJson = await dlRes.json();
      if (!dlRes.ok) throw new Error(dlJson.error || "Download failed");

      // Open download
      window.location.href = dlJson.url;
    } catch (e) {
      alert(e.message ?? String(e));
    } finally {
      setBusy(false);
    }
  }

  if (!p) return <div style={{ padding: 16 }}>Loading...</div>;

  return (
    <div style={{ padding: 16 }}>
      <h2>{p.title}</h2>
      <div>{p.price_pi} PI</div>
      <p>{p.description}</p>

      <button disabled={busy} onClick={buyWithPi}>
        {busy ? "Processing..." : "Buy & Download"}
      </button>
    </div>
  );
}
