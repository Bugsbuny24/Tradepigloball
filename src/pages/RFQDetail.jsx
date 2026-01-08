import React from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { getAuthDebug } from "../lib/debugAuth";

export default function RFQDetail() {
  const { id } = useParams();

  const [authDbg, setAuthDbg] = React.useState(null);
  const [me, setMe] = React.useState(null);

  const [rfq, setRfq] = React.useState(null);
  const [offers, setOffers] = React.useState([]);
  const [loading, setLoading] = React.useState(false);

  // offer form (seller kendi teklifini girer/günceller)
  const [pricePi, setPricePi] = React.useState("");
  const [message, setMessage] = React.useState("");

  const isBuyer = me?.id && rfq?.buyer_id && me.id === rfq.buyer_id;

  async function loadMe() {
    const dbg = await getAuthDebug();
    setAuthDbg(dbg);

    const { data } = await supabase.auth.getUser();
    setMe(data?.user || null);
  }

  async function loadRFQ() {
    if (!id) return;

    const { data, error } = await supabase
      .from("rfqs")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.log(error);
      setRfq(null);
      return;
    }
    setRfq(data);
  }

  async function loadOffers() {
    if (!id) return;

    // RLS zaten filtreleyecek:
    // - buyer ise: kendi rfq'suna gelen tüm offers
    // - seller ise: sadece kendi offer'ı
    const { data, error } = await supabase
      .from("rfq_offers")
      .select("*")
      .eq("rfq_id", id)
      .order("created_at", { ascending: false });

    if (error) {
      console.log(error);
      setOffers([]);
      return;
    }

    setOffers(data || []);

    // seller için formu kendi offer'ından dolduralım
    const myOffer = (data || []).find(o => o.owner_id === me?.id);
    if (myOffer) {
      setPricePi(myOffer.price_pi ?? "");
      setMessage(myOffer.message ?? "");
    }
  }

  React.useEffect(() => {
    (async () => {
      await loadMe();
      await loadRFQ();
    })();


    const { data: sub } = supabase.auth.onAuthStateChange(async () => {
      await loadMe();
      await loadRFQ();
    });

    return () => sub?.subscription?.unsubscribe?.();
  }, [id]);

  React.useEffect(() => {
    // me ve rfq geldikten sonra offers çek
    if (!id) return;
    if (me === null) return; // login yoksa seller offer insert de yapamasın

    loadOffers();
  }, [id, me?.id, rfq?.buyer_id]);

  async function upsertMyOffer() {
    if (!me?.id) {
      alert("Önce Login ol kanka.");
      return;
    }
    if (!id) return;

    const p = pricePi === "" ? null : Number(pricePi);
    if (p !== null && Number.isNaN(p)) {
      alert("price_pi sayı olmalı kanka 😄");
      return;
    }

    setLoading(true);
    try {
      // NOT: unique constraint yoksa duplicate offer çıkabilir.
      // En sağlıklısı: rfq_offers'a UNIQUE(rfq_id, owner_id) eklemek.
      // Şimdilik: önce benim offer var mı bak -> update/insert
      const existing = offers.find(o => o.owner_id === me.id);

      if (existing) {
        const { error } = await supabase
          .from("rfq_offers")
          .update({
            price_pi: p,
            message: message || null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existing.id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from("rfq_offers").insert({
          rfq_id: id,
          owner_id: me.id, // policy zaten owner_id=auth.uid ister
          price_pi: p,
          message: message || null,
          status: "pending",
        });

        if (error) throw error;
      }

      await loadOffers();
      alert("Offer kaydedildi ✅");
    } catch (e) {
      alert(e?.message || "Hata");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <Link to="/pi/rfqs" style={{ color: "#b9b4ff" }}>← RFQs</Link>
        <div style={{ opacity: 0.7 }}>#{id}</div>
      </div>

      <h2 style={{ marginTop: 12 }}>RFQ Detail</h2>

      <div style={dbgBox}>
        <b>Auth Debug (telefon)</b>
        <div>userId: {authDbg?.userId ?? "-"}</div>
        <div>email: {authDbg?.email ?? "-"}</div>
        <div>error: {authDbg?.error ?? "-"}</div>
      </div>

      {!rfq ? (
        <div style={{ opacity: 0.8 }}>RFQ bulunamadı / yükleniyor...</div>
      ) : (
        <div style={card}>
          <div style={{ fontSize: 18, fontWeight: 700 }}>{rfq.title}</div>
          {rfq.description ? <div style={{ marginTop: 6 }}>{rfq.description}</div> : null}
          {rfq.notes ? <div style={{ marginTop: 6, opacity: 0.85 }}><b>Notes:</b> {rfq.notes}</div> : null}

          <div style={{ marginTop: 10, display: "grid", gap: 6, opacity: 0.9 }}>
            <div><b>Status:</b> {rfq.status}</div>
            <div><b>Buyer:</b> {rfq.buyer_id}</div>
            {rfq.country ? <div><b>Country:</b> {rfq.country}</div> : null}
            {rfq.budget_pi != null ? <div><b>Budget (Pi):</b> {String(rfq.budget_pi)}</div> : null}
            {rfq.deadline ? <div><b>Deadline:</b> {String(rfq.deadline)}</div> : null}
          </div>
        </div>
      )}

      <div style={{ marginTop: 14 }}>
        <h3>Offers</h3>

        {!me?.id ? (
          <div style={{ opacity: 0.85 }}>Offer vermek için login olman lazım kanka.</div>
        ) : (
          <>
            {!isBuyer ? (
              <div style={card}>
                <div style={{ fontWeight: 700, marginBottom: 8 }}>Senin Offer’ın</div>

                <div style={{ display: "grid", gap: 10, maxWidth: 520 }}>
                  <input
                    value={pricePi}
                    onChange={(e) => setPricePi(e.target.value)}
                    placeholder="price_pi (Pi)"
                    style={inp}
                  />
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="message"
                    style={txt}
                  />
                  <button onClick={upsertMyOffer} disabled={loading} style={btn}>
                    {loading ? "Saving..." : "Save Offer"}
                  </button>

                  <div style={{ opacity: 0.75, fontSize: 13 }}>
                    Not: Seller sadece kendi offer’ını görür. Buyer kendi RFQ’suna gelen tüm offer’ları görür.
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ opacity: 0.85, marginBottom: 10 }}>
                Buyer mod: Bu RFQ’ya gelen tüm teklifleri görüyorsun.
              </div>
            )}
          </>
        )}

        <div style={{ marginTop: 10 }}>
          {offers.length ? (
            offers.map(o => (
              <div key={o.id} style={card}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                  <b>price_pi: {o.price_pi ?? "-"}</b>
                  <span style={{ opacity: 0.75 }}>{o.status}</span>
                </div>
                <div style={{ marginTop: 6 }}>{o.message || <span style={{ opacity: 0.7 }}>(no message)</span>}</div>
                <div style={{ marginTop: 8, opacity: 0.75, fontSize: 12 }}>
                  owner_id: {o.owner_id}
                </div>
              </div>
            ))
          ) : (
            <div style={{ opacity: 0.8 }}>Henüz offer yok.</div>
          )}
        </div>
      </div>
    </div>
  );
}

const inp = {
  padding: 12, borderRadius: 12, background: "rgba(0,0,0,.18)",
  color: "white", border: "1px solid rgba(255,255,255,.12)"
};
const txt = { ...inp, minHeight: 90 };
const btn = { padding: 12, borderRadius: 14, background: "#6d5cff", color: "white", border: "none" };
const card = { padding: 12, marginTop: 10, borderRadius: 12, background: "rgba(0,0,0,.18)", border: "1px solid rgba(255,255,255,.06)" };
const dbgBox = { margin: "12px 0", padding: 10, border: "1px dashed #555" };
