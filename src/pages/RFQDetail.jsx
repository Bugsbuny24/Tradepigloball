import React from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { getAuthDebug } from "../lib/debugAuth";
import { spendCredit } from "../lib/credits";

export default function RFQDetail() {
  const { id } = useParams();
  const nav = useNavigate();

  const [rfq, setRfq] = React.useState(null);
  const [offers, setOffers] = React.useState([]);
  const [loading, setLoading] = React.useState(false);

  const [pricePi, setPricePi] = React.useState("");
  const [message, setMessage] = React.useState("");

  const [authDbg, setAuthDbg] = React.useState(null);

  async function load() {
    const dbg = await getAuthDebug();
    setAuthDbg(dbg);

    const { data: rfqData, error: rfqErr } = await supabase
      .from("rfqs")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (!rfqErr) setRfq(rfqData || null);

    const { data: offerData, error: offerErr } = await supabase
      .from("rfq_offers")
      .select("id, rfq_id, owner_id, price_pi, message, status, created_at")
      .eq("rfq_id", id)
      .order("created_at", { ascending: false });

    if (!offerErr) setOffers(offerData || []);
  }

  React.useEffect(() => {
    load();
    const { data: sub } = supabase.auth.onAuthStateChange(() => load());
    return () => sub?.subscription?.unsubscribe?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function onCreateOffer() {
    const dbg = await getAuthDebug();
    setAuthDbg(dbg);

    if (!dbg?.userId) {
      alert("Önce login ol kanka.");
      nav("/login");
      return;
    }

    const n = Number(String(pricePi).replace(",", "."));
    if (!Number.isFinite(n) || n <= 0) {
      alert("Price (Pi) zorunlu. 0'dan büyük sayı gir.");
      return;
    }

    setLoading(true);
    try {
      // Offer ücretli ise:
      await spendCredit("OFFER_CREATE", 1, `offer for rfq ${id}`);

      const payload = {
        rfq_id: id,
        price_pi: n,           // ✅ NOT NULL garantili
        message: message || "",
      };

      // tek offer istiyorsan (owner_id + rfq_id unique) upsert kullan
      const { error } = await supabase.from("rfq_offers").insert(payload);
      if (error) throw error;

      alert("Offer created ✅");
      setPricePi("");
      setMessage("");
      await load();
    } catch (e) {
      alert(e?.message || "Hata");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: 16 }}>
      <Link to="/rfqs" style={{ color: "white", textDecoration: "none" }}>← Back</Link>

      <h2>RFQ Detail</h2>

      <div style={dbgBox}>
        <b>Auth Debug</b>
        <div>userId: {authDbg?.userId ?? "-"}</div>
        <div>email: {authDbg?.email ?? "-"}</div>
      </div>

      {rfq ? (
        <div style={card}>
          <b>{rfq.title}</b>
          <div style={{ opacity: 0.9, marginTop: 6, whiteSpace: "pre-wrap" }}>{rfq.description}</div>
          {rfq.notes ? <div style={{ opacity: 0.8, marginTop: 8 }}>notes: {rfq.notes}</div> : null}
          <div style={{ opacity: 0.7, marginTop: 8 }}>status: {rfq.status}</div>
        </div>
      ) : (
        <div style={{ marginTop: 10 }}>RFQ not found.</div>
      )}

      <h3 style={{ marginTop: 18 }}>Create Offer (Paid)</h3>
      <div style={card}>
        <input
          value={pricePi}
          onChange={(e) => setPricePi(e.target.value)}
          placeholder="price_pi (Pi) *"
          style={inp}
        />
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="message"
          style={txt}
        />
        <button onClick={onCreateOffer} disabled={loading} style={btn}>
          {loading ? "Working..." : "Create Offer (1 credit)"}
        </button>
      </div>

      <h3 style={{ marginTop: 18 }}>Offers</h3>
      <div style={card}>
        {offers.length ? (
          offers.map((o) => (
            <div key={o.id} style={mini}>
              <div><b>price_pi:</b> {o.price_pi}</div>
              <div style={{ whiteSpace: "pre-wrap", opacity: 0.9 }}>{o.message}</div>
              <div style={{ opacity: 0.7, marginTop: 6 }}>owner_id: {o.owner_id}</div>
            </div>
          ))
        ) : (
          <div style={{ opacity: 0.8 }}>No offers yet.</div>
        )}
      </div>
    </div>
  );
}

const inp = {
  padding: 12,
  borderRadius: 12,
  background: "rgba(0,0,0,.18)",
  color: "white",
  border: "1px solid rgba(255,255,255,.12)",
};
const txt = { ...inp, minHeight: 90 };
const btn = { padding: 12, borderRadius: 14, background: "#6d5cff", color: "white", border: "none", fontWeight: 800 };
const card = { padding: 12, marginTop: 10, borderRadius: 12, background: "rgba(0,0,0,.18)" };
const mini = { padding: 10, borderRadius: 10, background: "rgba(255,255,255,.06)", marginTop: 10 };
const dbgBox = { margin: "12px 0", padding: 10, border: "1px dashed #555", borderRadius: 12 };
