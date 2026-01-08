// ... mevcut importlar
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { getAuthDebug } from "../lib/debugAuth";
import { spendCredit } from "../lib/credits";

export default function RFQDetail() {
  const { id } = useParams();
  const nav = useNavigate();

  const [rfq, setRfq] = React.useState(null);
  const [offers, setOffers] = React.useState([]);
  const [authDbg, setAuthDbg] = React.useState(null);

  const [pricePi, setPricePi] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  async function loadAll() {
    const dbg = await getAuthDebug();
    setAuthDbg(dbg);

    const r1 = await supabase.from("rfqs").select("*").eq("id", id).maybeSingle();
    if (!r1.error) setRfq(r1.data);

    const r2 = await supabase.from("rfq_offers").select("*").eq("rfq_id", id).order("created_at", { ascending: false });
    if (!r2.error) setOffers(r2.data || []);
  }

  React.useEffect(() => {
    loadAll();
    const { data: sub } = supabase.auth.onAuthStateChange(() => loadAll());
    return () => sub.subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const isBuyer = !!(authDbg?.userId && rfq?.buyer_id && authDbg.userId === rfq.buyer_id);

  async function onUpsertOfferPaid() {
    const dbg = await getAuthDebug();
    setAuthDbg(dbg);
    if (!dbg?.userId) return alert("Önce login ol kanka.");

    const n = Number(pricePi);
    if (!Number.isFinite(n) || n <= 0) return alert("price_pi sayı olmalı (0’dan büyük).");

    setLoading(true);
    try {
      // paid offer: 1 kredi
      await spendCredit("RFQ_OFFER_PAID", 1, "paid offer");

      const { data, error } = await supabase.rpc("rpc_offer_upsert_paid", {
        p_rfq_id: id,
        p_price_pi: n,
        p_message: message || "",
      });

      if (error) throw error;

      await loadAll();
      alert("Offer saved ✅");
    } catch (e) {
      alert(e?.message || "Hata");
    } finally {
      setLoading(false);
    }
  }

  async function onAcceptOffer(offerId) {
    if (!isBuyer) return alert("Sadece RFQ sahibi kabul edebilir kanka.");

    setLoading(true);
    try {
      const { data: orderId, error } = await supabase.rpc("rpc_order_create_from_offer", {
        p_offer_id: offerId,
      });
      if (error) throw error;

      alert("Order created ✅");
      nav(`/orders/${orderId}`);
    } catch (e) {
      alert(e?.message || "Hata");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: 16 }}>
      <button onClick={() => nav(-1)} style={btn2}>← Back</button>

      <h2>RFQ Detail</h2>

      <div style={dbgBox}>
        <b>Auth Debug</b>
        <div>userId: {authDbg?.userId ?? "-"}</div>
        <div>email: {authDbg?.email ?? "-"}</div>
      </div>

      {rfq ? (
        <div style={card}>
          <b>{rfq.title}</b>
          <div style={{ opacity: 0.85, marginTop: 6, whiteSpace: "pre-wrap" }}>{rfq.description}</div>
          <div style={{ opacity: 0.75, marginTop: 8 }}>status: {rfq.status}</div>
        </div>
      ) : (
        <div style={{ opacity: 0.8 }}>Loading RFQ...</div>
      )}

      <h3 style={{ marginTop: 18 }}>My Offer</h3>
      <div style={card}>
        <input value={pricePi} onChange={(e) => setPricePi(e.target.value)} placeholder="price_pi (PI)" style={inp} />
        <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="message" style={txt} />
        <button onClick={onUpsertOfferPaid} disabled={loading} style={btn}>
          {loading ? "Saving..." : "Create/Update Offer (1 credit)"}
        </button>
        <div style={{ opacity: 0.7, marginTop: 6 }}>Not: Seller’lar birbirinin teklifini görmez. Açık artırma yok ✅</div>
      </div>

      <h3 style={{ marginTop: 18 }}>Offers on this RFQ (Buyer view)</h3>
      <div style={{ opacity: 0.7, marginBottom: 8 }}>Sadece RFQ sahibi bu listeyi görebilir.</div>

      {offers.length ? (
        offers.map((o) => (
          <div key={o.id} style={card}>
            <div><b>price_pi:</b> {o.price_pi}</div>
            <div style={{ opacity: 0.85, marginTop: 6, whiteSpace: "pre-wrap" }}>{o.message}</div>
            <div style={{ opacity: 0.75, marginTop: 6 }}>status: {</* */""}{o.status}{/* */}</div>

            {isBuyer ? (
              <button
                onClick={() => onAcceptOffer(o.id)}
                disabled={loading || o.status === "accepted"}
                style={{ ...btn, marginTop: 10 }}
              >
                {o.status === "accepted" ? "Accepted ✅" : "Accept → Create Order"}
              </button>
            ) : null}
          </div>
        ))
      ) : (
        <div style={card}>Henüz teklif yok.</div>
      )}
    </div>
  );
}

const inp = {
  padding: 12,
  borderRadius: 12,
  background: "rgba(0,0,0,.18)",
  color: "white",
  border: "1px solid rgba(255,255,255,.12)",
  width: "100%",
  boxSizing: "border-box",
};
const txt = { ...inp, minHeight: 90, marginTop: 8 };
const btn = { padding: 12, borderRadius: 14, background: "#6d5cff", color: "white", border: "none", fontWeight: 800, width: "100%" };
const btn2 = { padding: 10, borderRadius: 12, background: "rgba(255,255,255,.08)", color: "white", border: "1px solid rgba(255,255,255,.12)" };
const card = { padding: 12, marginTop: 10, borderRadius: 12, background: "rgba(0,0,0,.18)" };
const dbgBox = { margin: "12px 0", padding: 10, border: "1px dashed #555", borderRadius: 12 };
