import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { getAuthDebug } from "../lib/debugAuth";

export default function RFQDetail() {
  const { id } = useParams();
  const nav = useNavigate();

  const [authDbg, setAuthDbg] = React.useState(null);
  const [meId, setMeId] = React.useState(null);

  const [credits, setCredits] = React.useState(null);

  const [rfq, setRfq] = React.useState(null);
  const [offers, setOffers] = React.useState([]); // buyer ise kendi RFQ'suna gelenleri de görür
  const [myOffer, setMyOffer] = React.useState(null);

  const [pricePi, setPricePi] = React.useState("");
  const [message, setMessage] = React.useState("");

  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [err, setErr] = React.useState("");

  async function loadAuth() {
    const dbg = await getAuthDebug();
    setAuthDbg(dbg);
    setMeId(dbg?.userId || null);
    return dbg?.userId || null;
  }

  async function loadCredits() {
    setCredits(null);
    const { data, error } = await supabase.rpc("rpc_wallet_me");
    if (!error) {
      const bal = typeof data === "number" ? data : Number(data);
      setCredits(Number.isFinite(bal) ? bal : 0);
      return;
    }
    setCredits(0);
  }

  async function loadRFQ() {
    setErr("");
    const { data, error } = await supabase.from("rfqs").select("*").eq("id", id).single();
    if (error) {
      setErr(error.message || "RFQ load failed");
      setRfq(null);
      return null;
    }
    setRfq(data);
    return data;
  }

  async function loadOffers(userId) {
    setOffers([]);
    setMyOffer(null);
    setPricePi("");
    setMessage("");

    if (!userId) return;

    // RLS otomatik filtreler:
    // - seller: sadece kendi offer'ı gelir
    // - buyer(rfq owner): rfq'ya gelen tüm offer'lar gelir
    const { data, error } = await supabase
      .from("rfq_offers")
      .select("*")
      .eq("rfq_id", id)
      .order("created_at", { ascending: false });

    if (error) {
      console.log("offers load error:", error);
      return;
    }

    const list = data || [];
    setOffers(list);

    const mine = list.find((o) => o.owner_id === userId) || null;
    setMyOffer(mine);

    if (mine) {
      setPricePi(mine.price_pi ?? "");
      setMessage(mine.message ?? "");
    }
  }

  React.useEffect(() => {
    let alive = true;

    (async () => {
      setLoading(true);
      try {
        const userId = await loadAuth();
        if (!userId) {
          setErr("Önce login ol kanka.");
          return;
        }

        await Promise.all([loadCredits(), loadRFQ()]);
        await loadOffers(userId);
      } catch (e) {
        setErr(e?.message || "Unknown error");
      } finally {
        if (alive) setLoading(false);
      }
    })();

    const { data: sub } = supabase.auth.onAuthStateChange(async () => {
      const userId = await loadAuth();
      if (userId) {
        await loadCredits();
        await loadOffers(userId);
      }
    });

    return () => {
      alive = false;
      sub?.subscription?.unsubscribe?.();
    };
  }, [id]);

  async function saveOfferPaidFirstTime() {
    if (!meId) {
      alert("Önce login ol kanka.");
      return;
    }

    setSaving(true);
    setErr("");

    try {
      const p = pricePi === "" ? null : Number(pricePi);
      if (p !== null && Number.isNaN(p)) {
        alert("price_pi sayı olmalı kanka 😄");
        return;
      }

      // ✅ Tek çağrı: offer yoksa kredi düşer, varsa bedava update
      const { data: offerId, error } = await supabase.rpc("rpc_offer_upsert_paid", {
        p_rfq_id: id,
        p_price_pi: p,
        p_message: message || "",
      });

      if (error) throw error;

      alert(myOffer ? "Offer updated ✅" : "Offer created ✅");
      await loadCredits();
      await loadOffers(meId);
      return offerId;
    } catch (e) {
      if (String(e?.message || "").includes("YETERSIZ_KREDI")) {
        alert("Kredi bitti kanka 😄");
        return;
      }
      if (String(e?.message || "").includes("NOT_AUTHENTICATED")) {
        alert("Önce login ol kanka.");
        return;
      }
      alert(e?.message || "Hata");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div style={{ padding: 16 }}>
        <div style={card}>Loading...</div>
      </div>
    );
  }

  if (!rfq) {
    return (
      <div style={{ padding: 16 }}>
        <div style={card}>
          <h2>RFQ Detail</h2>
          <div style={{ opacity: 0.85 }}>Bulunamadı.</div>
          {err ? <div style={{ marginTop: 10, color: "#ffb4b4" }}>{err}</div> : null}
          <button style={btn2} onClick={() => nav("/rfqs")}>Back to RFQs</button>
        </div>
      </div>
    );
  }

  const isBuyerOwner = meId && rfq?.buyer_id === meId;

  return (
    <div style={{ padding: 16, maxWidth: 980, margin: "0 auto" }}>
      <button style={btn2} onClick={() => nav("/rfqs")}>← Back</button>

      <h2 style={{ marginTop: 12 }}>RFQ Detail</h2>

      <div style={dbgRow}>
        <div style={dbgBox}>
          <b>Auth Debug</b>
          <div>userId: {authDbg?.userId ?? "-"}</div>
          <div>email: {authDbg?.email ?? "-"}</div>
        </div>

        <div style={dbgBox}>
          <b>Credits</b>
          <div>{credits === null ? "..." : credits}</div>
          <div style={{ fontSize: 12, opacity: 0.75 }}>
            Offer ilk kez: <b>2 kredi</b> (update bedava)
          </div>
        </div>
      </div>

      {err ? (
        <div style={errBox}>
          <b>Hata:</b> {err}
        </div>
      ) : null}

      <div style={card}>
        <div style={{ fontWeight: 900, fontSize: 18 }}>{rfq.title}</div>
        <div style={{ marginTop: 8, whiteSpace: "pre-wrap", opacity: 0.95 }}>
          {rfq.description || ""}
        </div>
        {rfq.notes ? (
          <div style={{ marginTop: 10, whiteSpace: "pre-wrap", opacity: 0.85 }}>
            <b>Notes:</b> {rfq.notes}
          </div>
        ) : null}

        <div style={{ marginTop: 10, opacity: 0.75, fontSize: 12 }}>
          <div>id: {rfq.id}</div>
          <div>buyer_id: {rfq.buyer_id}</div>
          <div>status: {rfq.status}</div>
          <div>you are: {isBuyerOwner ? "buyer(owner)" : "seller(view as offerer)"}</div>
        </div>
      </div>

      <div style={{ marginTop: 14 }}>
        <h3>My Offer</h3>

        {!meId ? (
          <div style={{ ...card, opacity: 0.9 }}>Offer vermek için login olman lazım.</div>
        ) : (
          <div style={card}>
            <div style={{ opacity: 0.9 }}>
              {myOffer ? (
                <>
                  <b>Status:</b> {myOffer.status}{" "}
                  <span style={{ opacity: 0.5 }}>•</span>{" "}
                  <span style={{ fontSize: 12, opacity: 0.75 }}>id: {myOffer.id}</span>
                </>
              ) : (
                <b>No offer yet</b>
              )}
            </div>

            <div style={{ display: "grid", gap: 10, maxWidth: 520, marginTop: 12 }}>
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
              <button onClick={saveOfferPaidFirstTime} disabled={saving} style={btn1}>
                {saving ? "Saving..." : myOffer ? "Update Offer (free)" : "Create Offer (2 credits)"}
              </button>

              <div style={{ fontSize: 12, opacity: 0.75 }}>
                Not: Seller’lar birbirinin teklifini görmez. Açık artırma yok ✅
              </div>
            </div>
          </div>
        )}
      </div>

      {isBuyerOwner ? (
        <div style={{ marginTop: 14 }}>
          <h3>Offers on this RFQ (Buyer view)</h3>
          <div style={{ fontSize: 12, opacity: 0.75, marginBottom: 8 }}>
            Sadece RFQ sahibi bu listeyi görebilir.
          </div>

          {offers.length === 0 ? (
            <div style={card}>Henüz teklif yok.</div>
          ) : (
            <div style={{ display: "grid", gap: 10 }}>
              {offers.map((o) => (
                <div key={o.id} style={card}>
                  <div style={{ fontWeight: 800 }}>
                    price_pi: {o.price_pi ?? "—"} <span style={{ opacity: 0.5 }}>•</span> status: {o.status}
                  </div>
                  <div style={{ marginTop: 6, whiteSpace: "pre-wrap", opacity: 0.9 }}>
                    {o.message || ""}
                  </div>
                  <div style={{ marginTop: 8, fontSize: 12, opacity: 0.7 }}>
                    offer_id: {o.id} • owner_id: {o.owner_id}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}

const card = {
  padding: 12,
  marginTop: 10,
  borderRadius: 12,
  background: "rgba(0,0,0,.18)",
  border: "1px solid rgba(255,255,255,.06)",
  color: "white",
};

const inp = {
  padding: 12,
  borderRadius: 12,
  background: "rgba(0,0,0,.18)",
  color: "white",
  border: "1px solid rgba(255,255,255,.12)",
};

const txt = { ...inp, minHeight: 90 };

const btn1 = {
  padding: 12,
  borderRadius: 14,
  background: "#6d5cff",
  color: "white",
  border: "none",
  cursor: "pointer",
  fontWeight: 800,
};

const btn2 = {
  padding: "10px 12px",
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,.12)",
  background: "rgba(0,0,0,.22)",
  color: "white",
  cursor: "pointer",
};

const dbgRow = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 12 };

const dbgBox = {
  padding: 10,
  border: "1px dashed #555",
  borderRadius: 12,
  opacity: 0.95,
};

const errBox = {
  marginTop: 12,
  padding: 12,
  borderRadius: 12,
  border: "1px solid rgba(255,0,0,.25)",
  background: "rgba(255,0,0,.06)",
  whiteSpace: "pre-wrap",
  color: "white",
};
