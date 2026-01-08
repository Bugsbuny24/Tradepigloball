import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { getAuthDebug } from "../lib/debugAuth";

const COST = { OFFER_CREATE: 1 };

export default function RFQDetail() {
  const { id } = useParams();
  const nav = useNavigate();

  const [authDbg, setAuthDbg] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [err, setErr] = React.useState("");

  const [rfq, setRfq] = React.useState(null);
  const [offers, setOffers] = React.useState([]);

  const [credits, setCredits] = React.useState(null);

  const [pricePi, setPricePi] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [busy, setBusy] = React.useState(false);

  async function loadCredits() {
    setCredits(null);

    const dbg = await getAuthDebug();
    setAuthDbg(dbg);
    if (!dbg?.userId) return;

    // 1) RPC varsa
    const { data, error } = await supabase.rpc("rpc_wallet_me");
    if (!error) {
      const n = typeof data === "number" ? data : Number(data) || 0;
      setCredits(n);
      return;
    }

    // 2) fallback: user_wallets
    const w = await supabase.from("user_wallets").select("balance").eq("user_id", dbg.userId).maybeSingle();
    if (!w.error) setCredits(Number(w.data?.balance ?? 0));
  }

  async function loadAll() {
    setLoading(true);
    setErr("");
    try {
      await loadCredits();

      const r = await supabase.from("rfqs").select("*").eq("id", id).maybeSingle();
      if (r.error) throw r.error;
      setRfq(r.data || null);

      const o = await supabase.from("rfq_offers").select("*").eq("rfq_id", id).order("created_at", { ascending: false });
      if (o.error) throw o.error;
      setOffers(o.data || []);
    } catch (e) {
      setErr(e?.message || "Load error");
      setRfq(null);
      setOffers([]);
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    loadAll();
    const { data: sub } = supabase.auth.onAuthStateChange(() => loadAll());
    return () => sub?.subscription?.unsubscribe?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function spendOfferCredit() {
    const { data, error } = await supabase.rpc("rpc_credit_spend", {
      p_action: "OFFER_CREATE",
      p_amount: COST.OFFER_CREATE,
      p_note: "offer create",
    });
    if (error) throw error;
    const newBal = typeof data === "number" ? data : Number(data);
    if (!Number.isNaN(newBal)) setCredits(newBal);
  }

  async function onCreateOffer() {
    setBusy(true);
    setErr("");
    try {
      const dbg = await getAuthDebug();
      setAuthDbg(dbg);

      if (!dbg?.userId) throw new Error("Önce Login ol kanka.");
      if (!rfq) throw new Error("RFQ not found.");

      const p = Number(pricePi);
      if (!Number.isFinite(p) || p <= 0) throw new Error("price_pi > 0 olmalı.");

      // 1) kredi düş
      await spendOfferCredit();

      // 2) offer insert (owner_id default auth.uid())
      const { error } = await supabase.from("rfq_offers").insert({
        rfq_id: rfq.id,
        price_pi: p,
        message: message || null,
      });
      if (error) throw error;

      setPricePi("");
      setMessage("");
      await loadAll();
    } catch (e) {
      if (e?.code === "YETERSIZ_KREDI") {
        setErr("Kredi bitti kanka 😄");
      } else if (e?.code === "NOT_AUTHENTICATED") {
        setErr("Önce Login ol kanka.");
      } else {
        setErr(e?.message || "Offer error");
      }
    } finally {
      setBusy(false);
    }
  }

  async function acceptOffer(offer) {
    setBusy(true);
    setErr("");
    try {
      const dbg = await getAuthDebug();
      setAuthDbg(dbg);

      if (!dbg?.userId) throw new Error("Login required");
      if (!rfq) throw new Error("RFQ not found");

      // sadece RFQ sahibi kabul etsin (buyer_id = auth.uid())
      if (rfq.buyer_id !== dbg.userId) throw new Error("Only RFQ owner can accept offers.");

      // offer status accepted
      const u1 = await supabase
        .from("rfq_offers")
        .update({ status: "accepted", updated_at: new Date().toISOString() })
        .eq("id", offer.id);
      if (u1.error) throw u1.error;

      // diğer offerları rejected (opsiyonel)
      await supabase
        .from("rfq_offers")
        .update({ status: "rejected", updated_at: new Date().toISOString() })
        .eq("rfq_id", rfq.id)
        .neq("id", offer.id);

      // order create
      const ins = await supabase.from("orders").insert({
        rfq_id: rfq.id,
        offer_id: offer.id,
        buyer_id: rfq.buyer_id,
        seller_id: offer.owner_id,
        amount_pi: offer.price_pi,
        price_pi: offer.price_pi,
        status: "pending_payment",
      }).select("id").maybeSingle();

      if (ins.error) throw ins.error;

      await loadAll();
      if (ins.data?.id) nav(`/orders/${ins.data.id}`);
    } catch (e) {
      setErr(e?.message || "Accept error (RLS?)");
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <div style={page}><div style={card}>Loading…</div></div>;
  if (err && !rfq) return <div style={page}><div style={card}><b>Hata:</b> {err}</div></div>;
  if (!rfq) return <div style={page}><div style={card}>RFQ not found.</div></div>;

  const me = authDbg?.userId || null;
  const isOwner = me && rfq.buyer_id === me;

  return (
    <div style={page}>
      <div style={card}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
          <h2 style={{ margin: 0 }}>RFQ Detail</h2>
          <button style={btn2} onClick={() => nav("/rfqs")}>Back</button>
        </div>

        <div style={{ marginTop: 10, opacity: 0.9 }}>
          <div><b>Title:</b> {rfq.title}</div>
          <div><b>Description:</b> {rfq.description || "-"}</div>
          <div><b>Country:</b> {rfq.country || "-"}</div>
          <div><b>Status:</b> {rfq.status}</div>
          <div style={{ marginTop: 8 }}><b>Credits:</b> {credits === null ? "..." : credits}</div>
          <div style={{ opacity: 0.75 }}>Offer atmak <b>{COST.OFFER_CREATE} kredi</b> yer.</div>
        </div>

        <div style={dbgBox}>
          <b>Auth Debug</b>
          <div>userId: {authDbg?.userId ?? "-"}</div>
          <div>email: {authDbg?.email ?? "-"}</div>
          <div>rfq_owner: {String(isOwner)}</div>
        </div>

        {err ? <div style={errBox}><b>Hata:</b> {err}</div> : null}

        {/* Create Offer */}
        <div style={{ marginTop: 12, padding: 12, borderRadius: 12, background: "rgba(255,255,255,.04)" }}>
          <h3 style={{ margin: "0 0 10px 0" }}>Create Offer</h3>

          <div style={{ display: "grid", gap: 10, maxWidth: 520 }}>
            <input
              value={pricePi}
              onChange={(e) => setPricePi(e.target.value)}
              placeholder="price_pi (number)"
              style={inp}
            />
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="message (optional)"
              style={{ ...inp, minHeight: 90 }}
            />
            <button style={btn} disabled={busy} onClick={onCreateOffer}>
              {busy ? "Working…" : `Submit Offer (${COST.OFFER_CREATE} credit)`}
            </button>
          </div>
        </div>

        {/* Offers */}
        <div style={{ marginTop: 14 }}>
          <h3 style={{ margin: "0 0 10px 0" }}>Offers</h3>

          {offers.length === 0 ? (
            <div style={{ opacity: 0.75 }}>No offers yet.</div>
          ) : (
            <div style={{ display: "grid", gap: 10 }}>
              {offers.map((o) => (
                <div key={o.id} style={offerCard}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                    <div style={{ fontWeight: 900 }}>Price: {o.price_pi} Pi</div>
                    <span style={badge(o.status)}>{o.status}</span>
                  </div>
                  <div style={{ opacity: 0.75, marginTop: 6 }}>Seller: {o.owner_id}</div>
                  {o.message ? <div style={{ marginTop: 6, opacity: 0.9 }}>{o.message}</div> : null}

                  {isOwner && rfq.status === "open" && o.status === "pending" ? (
                    <div style={{ marginTop: 10 }}>
                      <button style={btn2} disabled={busy} onClick={() => acceptOffer(o)}>
                        Accept → Create Order
                      </button>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

const page = { padding: 16, maxWidth: 980, margin: "0 auto" };
const card = { padding: 16, borderRadius: 16, border: "1px solid rgba(255,255,255,.12)", background: "rgba(0,0,0,.22)" };
const dbgBox = { marginTop: 12, padding: 10, border: "1px dashed #555", borderRadius: 12 };
const inp = { padding: 12, borderRadius: 12, background: "rgba(0,0,0,.18)", color: "white", border: "1px solid rgba(255,255,255,.12)" };
const btn = { padding: 12, borderRadius: 14, background: "#6d5cff", color: "white", border: "none", fontWeight: 900, cursor: "pointer" };
const btn2 = { padding: 12, borderRadius: 14, background: "rgba(255,255,255,.06)", color: "white", border: "1px solid rgba(255,255,255,.14)", fontWeight: 800, cursor: "pointer" };
const offerCard = { padding: 12, borderRadius: 12, border: "1px solid rgba(255,255,255,.10)", background: "rgba(255,255,255,.03)" };
const errBox = { marginTop: 12, padding: 12, borderRadius: 12, border: "1px solid rgba(255,0,0,.25)", background: "rgba(255,0,0,.06)" };

function badge(s) {
  return {
    padding: "4px 10px",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,.18)",
    background: "rgba(255,255,255,.06)",
    fontSize: 12,
    fontWeight: 900,
    alignSelf: "flex-start",
  };
        }
