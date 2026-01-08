// src/pages/RFQDetail.jsx
import React from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { getAuthDebug } from "../lib/debugAuth";
import { spendCredit } from "../lib/credits";

export default function RFQDetail() {
  const { id } = useParams();

  const [loading, setLoading] = React.useState(false);
  const [rfq, setRfq] = React.useState(null);

  const [authDbg, setAuthDbg] = React.useState(null);
  const [credits, setCredits] = React.useState(null);

  const [myOffer, setMyOffer] = React.useState(null);
  const [pricePi, setPricePi] = React.useState("");
  const [message, setMessage] = React.useState("");

  const [buyerOffers, setBuyerOffers] = React.useState([]);

  async function loadCredits(userId) {
    setCredits(null);
    const { data, error } = await supabase
      .from("user_wallets")
      .select("balance")
      .eq("user_id", userId)
      .maybeSingle();

    if (!error && data) setCredits(data.balance ?? 0);
    else setCredits(0);
  }
async function acceptOffer(offerId) {
  const { data, error } = await supabase.rpc("rpc_accept_offer", {
    p_offer_id: offerId,
  });

  if (error) {
    alert(error.message);
    return;
  }

  // data = order_id dönüyor
  const orderId = data;
  alert("Order created ✅");
  window.location.href = `/orders/${orderId}`;
}
  async function loadRFQ() {
    const { data, error } = await supabase.from("rfqs").select("*").eq("id", id).maybeSingle();
    if (error) throw error;
    setRfq(data || null);
  }

  async function loadMyOffer(userId) {
    const { data, error } = await supabase
      .from("rfq_offers")
      .select("*")
      .eq("rfq_id", id)
      .eq("owner_id", userId)
      .maybeSingle();

    if (error) throw error;
    setMyOffer(data || null);
    setPricePi(data?.price_pi != null ? String(data.price_pi) : "");
    setMessage(data?.message ?? "");
  }

  async function loadBuyerOffers() {
    // buyer sadece kendi RFQ'suna gelen teklifleri görsün diye RLS/SQL tarafında kuralın var zaten.
    const { data, error } = await supabase
      .from("rfq_offers")
      .select("id, rfq_id, owner_id, price_pi, message, status, created_at")
      .eq("rfq_id", id)
      .order("created_at", { ascending: false });

    if (error) throw error;
    setBuyerOffers(data || []);
  }

  React.useEffect(() => {
    (async () => {
      const dbg = await getAuthDebug();
      setAuthDbg(dbg);

      await loadRFQ();

      if (dbg?.userId) {
        await loadCredits(dbg.userId);
        await loadMyOffer(dbg.userId);
        await loadBuyerOffers();
      }
    })();

    const { data: sub } = supabase.auth.onAuthStateChange(async () => {
      const dbg = await getAuthDebug();
      setAuthDbg(dbg);

      await loadRFQ();

      if (dbg?.userId) {
        await loadCredits(dbg.userId);
        await loadMyOffer(dbg.userId);
        await loadBuyerOffers();
      } else {
        setCredits(0);
        setMyOffer(null);
        setBuyerOffers([]);
      }
    });

    return () => sub?.subscription?.unsubscribe?.();
  }, [id]);

  async function onUpsertOffer() {
    const dbg = await getAuthDebug();
    setAuthDbg(dbg);

    if (!dbg?.userId) {
      alert("Önce Login ol kanka.");
      return;
    }

    // ✅ price zorunlu + number parse
    const n = Number(String(pricePi).replace(",", "."));
    if (!Number.isFinite(n) || n <= 0) {
      alert("Price (Pi) zorunlu. 0'dan büyük sayı gir kanka.");
      return;
    }

    setLoading(true);
    try {
      // 1) kredi düş (ilk kez ise ücretli; update bedava diyorsan SQL/RPC ile kontrol edebilirsin)
      // şimdilik her upsert 1 kredi diye gidiyorsa:
      await spendCredit("OFFER_CREATE", 1, "rfq offer");

      // 2) upsert
      const payload = {
        rfq_id: id,
        owner_id: dbg.userId,
        price_pi: n,
        message: message || "",
        status: "pending",
      };

      const { error } = await supabase.from("rfq_offers").upsert(payload, {
        onConflict: "rfq_id,owner_id",
      });

      if (error) throw error;

      await loadCredits(dbg.userId);
      await loadMyOffer(dbg.userId);
      await loadBuyerOffers();

      alert("Offer saved ✅");
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

      <div style={dbgBox}>
        <b>Credits</b>
        <div>{credits === null ? "..." : credits}</div>
        <div style={{ opacity: 0.8, marginTop: 6 }}>Offer ilk kez: 1 kredi (update bedava)</div>
      </div>

      {rfq ? (
        <div style={card}>
          <b>{rfq.title}</b>
          <div style={{ whiteSpace: "pre-wrap", marginTop: 8 }}>
            {rfq.description}
            {rfq.notes ? `\n\nNotes: ${rfq.notes}` : ""}
          </div>
          <div style={{ opacity: 0.7, marginTop: 8 }}>status: {rfq.status}</div>
        </div>
      ) : (
        <div>RFQ not found</div>
      )}

      <h3>My Offer</h3>
      <div style={card}>
        <div style={{ opacity: 0.8, marginBottom: 8 }}>
          {myOffer ? "You already have an offer (update)" : "No offer yet"}
        </div>

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
        <button onClick={onUpsertOffer} disabled={loading} style={btn}>
          {loading ? "Saving..." : "Save Offer (1 credit)"}
        </button>

        <div style={{ opacity: 0.75, marginTop: 6 }}>
          Not: Seller&apos;lar birbirinin teklifini görmez. Açık artırma yok ✅
        </div>
      </div>

      <h3>Offers on this RFQ (Buyer view)</h3>
      <div style={card}>
        <div style={{ opacity: 0.8 }}>Sadece RFQ sahibi bu listeyi görebilir.</div>
        {buyerOffers?.length ? (
          <div style={{ marginTop: 10, display: "grid", gap: 10 }}>
            {buyerOffers.map((o) => (
              <div key={o.id} style={mini}>
                <div><b>price:</b> {o.price_pi} Pi</div>
                <div style={{ whiteSpace: "pre-wrap" }}>{o.message}</div>
                <div style={{ opacity: 0.7, marginTop: 6 }}>seller: {o.owner_id}</div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ marginTop: 10, opacity: 0.8 }}>Henüz teklif yok.</div>
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
const btn = { padding: 12, borderRadius: 14, background: "#6d5cff", color: "white" };
const card = { padding: 12, marginTop: 10, borderRadius: 12, background: "rgba(0,0,0,.18)" };
const mini = { padding: 10, borderRadius: 10, background: "rgba(255,255,255,.06)" };
const dbgBox = { margin: "12px 0", padding: 10, border: "1px dashed #555", borderRadius: 12 };
