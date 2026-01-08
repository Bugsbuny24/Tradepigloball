import React from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { getAuthDebug } from "../lib/debugAuth";

export default function RFQDetail() {
  const { id } = useParams(); // rfq id
  const nav = useNavigate();

  const [loading, setLoading] = React.useState(true);
  const [rfq, setRfq] = React.useState(null);

  // teklif (sadece benim teklifim)
  const [myOffer, setMyOffer] = React.useState(null);
  const [pricePi, setPricePi] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  // telefonda auth debug
  const [authDbg, setAuthDbg] = React.useState(null);

  async function loadAll() {
    setLoading(true);
    try {
      const dbg = await getAuthDebug();
      setAuthDbg(dbg);

      // RFQ çek
      const { data: rfqRow, error: rfqErr } = await supabase
        .from("rfqs")
        .select("*")
        .eq("id", id)
        .single();

      if (rfqErr) throw rfqErr;
      setRfq(rfqRow);

      // login yoksa offer kısmını boş bırak
      if (!dbg?.userId) {
        setMyOffer(null);
        setPricePi("");
        setMessage("");
        return;
      }

      // BENİM teklifim (owner_id = auth.uid)
      const { data: offerRow, error: offerErr } = await supabase
        .from("rfq_offers")
        .select("*")
        .eq("rfq_id", id)
        .eq("owner_id", dbg.userId)
        .maybeSingle();

      if (offerErr) throw offerErr;

      setMyOffer(offerRow || null);
      setPricePi(offerRow?.price_pi?.toString?.() ?? "");
      setMessage(offerRow?.message ?? "");
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    loadAll();

    // auth değişince yenile
    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      loadAll();
    });

    return () => sub?.subscription?.unsubscribe?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function upsertMyOffer() {
    setSaving(true);
    try {
      const dbg = await getAuthDebug();
      setAuthDbg(dbg);

      if (!dbg?.userId) {
        alert("Önce Login ol kanka.");
        return;
      }

      const p = Number(pricePi);
      if (!pricePi || Number.isNaN(p) || p <= 0) {
        alert("price_pi sayı olmalı (0'dan büyük).");
        return;
      }

      // RLS doğruysa owner_id default auth.uid() ama biz yine de güvenli yazıyoruz
      // (policy owner_id = auth.uid() izin veriyorsa sorun olmaz)
      const payload = {
        rfq_id: id,
        owner_id: dbg.userId,
        price_pi: p,
        message: message || "",
        status: "pending",
      };

      if (myOffer?.id) {
        // update
        const { error } = await supabase
          .from("rfq_offers")
          .update(payload)
          .eq("id", myOffer.id);

        if (error) throw error;
        alert("Teklif güncellendi ✅");
      } else {
        // insert
        const { error } = await supabase.from("rfq_offers").insert(payload);
        if (error) throw error;
        alert("Teklif gönderildi ✅");
      }

      await loadAll();
    } catch (e) {
      alert(e?.message || "Hata");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div style={{ padding: 16 }}>Loading...</div>;

  if (!rfq)
    return (
      <div style={{ padding: 16 }}>
        <div style={{ marginBottom: 10 }}>
          <button onClick={() => nav(-1)} style={btnGhost}>
            ← Back
          </button>
        </div>
        RFQ bulunamadı.
      </div>
    );

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <button onClick={() => nav(-1)} style={btnGhost}>
          ← Back
        </button>
        <Link to="/rfqs" style={linkSoft}>
          RFQs
        </Link>
      </div>

      <h2 style={{ marginTop: 12 }}>RFQ Detail</h2>

      {/* RFQ kart */}
      <div style={card}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
          <b style={{ fontSize: 16 }}>{rfq.title}</b>
          <span style={pill}>{rfq.status || "open"}</span>
        </div>

        {rfq.description ? <div style={{ marginTop: 8 }}>{rfq.description}</div> : null}

        <div style={{ marginTop: 10, display: "grid", gap: 6 }}>
          {rfq.country ? <div>🌍 <b>Country:</b> {rfq.country}</div> : null}
          {rfq.budget_pi != null ? <div>💰 <b>Budget (Pi):</b> {rfq.budget_pi}</div> : null}
          {rfq.deadline ? <div>⏳ <b>Deadline:</b> {String(rfq.deadline)}</div> : null}
          {rfq.notes ? <div>📝 <b>Notes:</b> {rfq.notes}</div> : null}
        </div>
      </div>

      {/* Debug */}
      <div style={dbgBox}>
        <b>Auth Debug (telefon)</b>
        <div>userId: {authDbg?.userId ?? "-"}</div>
        <div>email: {authDbg?.email ?? "-"}</div>
        <div>error: {authDbg?.error ?? "-"}</div>
      </div>

      {/* Offer UI */}
      <div style={{ marginTop: 14 }}>
        <h3 style={{ marginBottom: 8 }}>My Offer</h3>

        <div style={card}>
          <div style={{ opacity: 0.85, marginBottom: 10 }}>
            Bu ekranda <b>sadece kendi teklifini</b> görürsün (auction’a dönmesin diye 👍)
          </div>

          <div style={{ display: "grid", gap: 10, maxWidth: 520 }}>
            <input
              value={pricePi}
              onChange={(e) => setPricePi(e.target.value)}
              placeholder="price_pi (Pi)"
              style={inp}
              inputMode="decimal"
            />
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="message"
              style={txt}
            />

            <button onClick={upsertMyOffer} disabled={saving} style={btn}>
              {saving ? "Saving..." : myOffer ? "Update Offer" : "Send Offer"}
            </button>

            {myOffer ? (
              <div style={{ opacity: 0.85, fontSize: 13 }}>
                Status: <b>{myOffer.status || "pending"}</b>
              </div>
            ) : null}
          </div>
        </div>
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
const btnGhost = {
  padding: "10px 12px",
  borderRadius: 12,
  background: "rgba(255,255,255,.08)",
  color: "white",
  border: "1px solid rgba(255,255,255,.10)",
};
const card = {
  padding: 12,
  marginTop: 10,
  borderRadius: 14,
  background: "rgba(0,0,0,.18)",
  border: "1px solid rgba(255,255,255,.08)",
};
const pill = {
  fontSize: 12,
  padding: "4px 10px",
  borderRadius: 999,
  background: "rgba(255,255,255,.10)",
};
const dbgBox = { marginTop: 12, padding: 10, border: "1px dashed #555", borderRadius: 12 };
const linkSoft = { color: "rgba(255,255,255,.85)", textDecoration: "none", padding: "8px 10px" };
