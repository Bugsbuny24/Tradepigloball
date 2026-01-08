import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { getAuthDebug } from "../lib/debugAuth";

export default function RFQDetail() {
  const { id } = useParams();
  const nav = useNavigate();

  const [authDbg, setAuthDbg] = React.useState(null);
  const [meId, setMeId] = React.useState(null);

  const [rfq, setRfq] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [err, setErr] = React.useState("");

  // Sadece "benim offer'ım"
  const [myOffer, setMyOffer] = React.useState(null);
  const [pricePi, setPricePi] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  async function loadAuth() {
    const dbg = await getAuthDebug();
    setAuthDbg(dbg);
    setMeId(dbg?.userId || null);
    return dbg?.userId || null;
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

  async function loadMyOffer(userId) {
    setMyOffer(null);
    setPricePi("");
    setMessage("");

    if (!userId) return;

    // RLS zaten sadece benim offer'ımı döndürecek
    const { data, error } = await supabase
      .from("rfq_offers")
      .select("*")
      .eq("rfq_id", id)
      .order("created_at", { ascending: false })
      .limit(5);

    if (error) {
      // auth yoksa veya policy hatası vs.
      console.log("offer load error:", error);
      return;
    }

    const mine = (data || []).find((o) => o.owner_id === userId) || (data || [])[0] || null;
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
        await loadRFQ();
        await loadMyOffer(userId);
      } catch (e) {
        setErr(e?.message || "Unknown error");
      } finally {
        if (alive) setLoading(false);
      }
    })();

    const { data: sub } = supabase.auth.onAuthStateChange(async () => {
      const userId = await loadAuth();
      await loadMyOffer(userId);
    });

    return () => {
      alive = false;
      sub?.subscription?.unsubscribe?.();
    };
  }, [id]);

  async function saveOffer() {
    if (!meId) {
      alert("Önce Login ol kanka.");
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

      // myOffer varsa UPDATE, yoksa INSERT
      if (myOffer?.id) {
        const { error } = await supabase
          .from("rfq_offers")
          .update({
            price_pi: p,
            message: message || null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", myOffer.id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from("rfq_offers").insert({
          rfq_id: id,
          // owner_id default auth.uid() ama net olsun diye de gönderebiliriz
          owner_id: meId,
          price_pi: p,
          message: message || null,
          status: "pending",
        });

        if (error) throw error;
      }

      alert("Offer kaydedildi ✅");
      await loadMyOffer(meId);
    } catch (e) {
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

  return (
    <div style={{ padding: 16, maxWidth: 900, margin: "0 auto" }}>
      <button style={btn2} onClick={() => nav("/rfqs")}>← Back</button>

      <h2 style={{ marginTop: 12 }}>RFQ Detail</h2>

      <div style={dbgBox}>
        <b>Auth Debug (telefon)</b>
        <div>userId: {authDbg?.userId ?? "-"}</div>
        <div>email: {authDbg?.email ?? "-"}</div>
        <div>error: {authDbg?.error ?? "-"}</div>
      </div>

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
        </div>
      </div>

      <div style={{ marginTop: 14 }}>
        <h3>My Offer</h3>

        {!meId ? (
          <div style={{ ...card, opacity: 0.9 }}>
            Offer vermek için login olman lazım kanka.
          </div>
        ) : (
          <div style={card}>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
              <div style={{ opacity: 0.9 }}>
                {myOffer ? (
                  <>
                    <b>Status:</b> {myOffer.status} <span style={{ opacity: 0.5 }}>•</span>{" "}
                    <span style={{ fontSize: 12, opacity: 0.75 }}>id: {myOffer.id}</span>
                  </>
                ) : (
                  <b>No offer yet</b>
                )}
              </div>
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
              <button onClick={saveOffer} disabled={saving} style={btn1}>
                {saving ? "Saving..." : myOffer ? "Update Offer" : "Create Offer"}
              </button>

              <div style={{ fontSize: 12, opacity: 0.75 }}>
                Not: Bu sayfada sadece <b>senin</b> teklifin görünür. Başkalarının teklifleri görünmez.
              </div>
            </div>
          </div>
        )}
      </div>
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
};

const btn2 = {
  padding: "10px 12px",
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,.12)",
  background: "rgba(0,0,0,.22)",
  color: "white",
  cursor: "pointer",
};

const dbgBox = {
  marginTop: 12,
  padding: 10,
  border: "1px dashed #555",
  borderRadius: 12,
  opacity: 0.95,
};
