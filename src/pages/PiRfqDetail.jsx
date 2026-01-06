import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import TopBar from "../components/TopBar";
import { supabase } from "../lib/supabaseClient";
import { useSession } from "../lib/session";

export default function PiRfqDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const { user } = useSession();
  const [rfq, setRfq] = useState(null);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  const isOwner = useMemo(() => {
    if (!user || !rfq) return false;
    return rfq.owner_id === user.id;
  }, [user, rfq]);

  const load = async () => {
    setLoading(true);
    setErr(null);

    const { data: r, error: e1 } = await supabase.from("rfqs").select("*").eq("id", id).single();
    if (e1) {
      setErr(e1.message);
      setRfq(null);
      setOffers([]);
      setLoading(false);
      return;
    }
    setRfq(r);

    const { data: o, error: e2 } = await supabase
      .from("rfq_offers")
      .select("id,owner_id,price_pi,message,status,created_at")
      .eq("rfq_id", id)
      .order("created_at", { ascending: false });

    // RLS yüzünden görünmüyorsa normal: RFQ owner + offer owner görür
    setOffers(e2 ? [] : o || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const [pricePi, setPricePi] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const submitOffer = async () => {
    if (!user) return alert("Login required");
    if (!pricePi) return alert("Price (Pi) required");

    setBusy(true);
    const { error } = await supabase.from("rfq_offers").insert([
      {
        rfq_id: id,
        owner_id: user.id,
        price_pi: Number(pricePi),
        message: message.trim() || null,
        status: "pending",
      },
    ]);
    setBusy(false);

    if (error) return alert(error.message);
    setPricePi("");
    setMessage("");
    load();
  };

  const acceptOffer = async (offerId) => {
    if (!isOwner) return alert("Only RFQ owner can accept");
    setBusy(true);
    const { error } = await supabase.rpc("accept_rfq_offer", { p_offer_id: offerId });
    setBusy(false);
    if (error) return alert(error.message);
    load();
  };

  return (
    <div style={{ padding: 24, color: "#fff" }}>
      <TopBar title="PI • RFQ Detail" />

      <div style={{ display: "flex", gap: 12, margin: "12px 0 20px" }}>
        <button onClick={() => nav("/pi/rfqs")}>Back</button>
        <button onClick={load}>Refresh</button>
      </div>

      {loading ? (
        <p>Loading…</p>
      ) : err ? (
        <pre style={{ whiteSpace: "pre-wrap", background: "#111", padding: 12, borderRadius: 10 }}>{err}</pre>
      ) : !rfq ? (
        <p>RFQ not found.</p>
      ) : (
        <>
          <div style={{ background: "rgba(0,0,0,0.35)", padding: 16, borderRadius: 16 }}>
            <div style={{ fontSize: 20, fontWeight: 900 }}>{rfq.title}</div>
            <div style={{ opacity: 0.85, marginTop: 8 }}>{rfq.description}</div>
            <div style={{ opacity: 0.8, marginTop: 10 }}>
              {rfq.country ? `Country: ${rfq.country} • ` : ""}Budget (Pi): {rfq.budget_pi ?? "-"}
              {rfq.deadline ? ` • Deadline: ${rfq.deadline}` : ""}
            </div>
            <div style={{ opacity: 0.65, marginTop: 8, fontSize: 12 }}>
              Status: {rfq.status} {isOwner ? "(You are owner)" : ""}
            </div>
          </div>

          <div style={{ marginTop: 18, background: "rgba(0,0,0,0.28)", padding: 16, borderRadius: 16 }}>
            <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 10 }}>Send Offer</div>
            <div style={{ display: "grid", gap: 10, maxWidth: 600 }}>
              <input
                placeholder="Price (Pi)"
                value={pricePi}
                onChange={(e) => setPricePi(e.target.value)}
                style={{ padding: 12, borderRadius: 12 }}
              />
              <textarea
                placeholder="Message (optional)"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                style={{ padding: 12, borderRadius: 12 }}
              />
              <button onClick={submitOffer} disabled={busy || rfq.status !== "open"}>
                {rfq.status !== "open" ? "RFQ closed" : busy ? "Sending…" : "Submit Offer"}
              </button>
              <div style={{ opacity: 0.65, fontSize: 12 }}>Offer görünürlüğü: sadece sen + RFQ sahibi.</div>
            </div>
          </div>

          <div style={{ marginTop: 18 }}>
            <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 10 }}>Offers</div>
            {offers.length === 0 ? (
              <p style={{ opacity: 0.8 }}>No offers (ya da RLS sebebiyle görünmüyor).</p>
            ) : (
              <div style={{ display: "grid", gap: 10 }}>
                {offers.map((o) => (
                  <div key={o.id} style={{ background: "rgba(0,0,0,0.35)", padding: 14, borderRadius: 14 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                      <div style={{ fontWeight: 800 }}>Pi: {o.price_pi}</div>
                      <div style={{ opacity: 0.8 }}>Status: {o.status}</div>
                    </div>
                    {o.message ? <div style={{ opacity: 0.9, marginTop: 8 }}>{o.message}</div> : null}
                    <div style={{ opacity: 0.6, marginTop: 8, fontSize: 12 }}>
                      {o.created_at ? new Date(o.created_at).toLocaleString() : ""}
                    </div>

                    {isOwner && o.status === "pending" ? (
                      <button style={{ marginTop: 10 }} onClick={() => acceptOffer(o.id)} disabled={busy || rfq.status !== "open"}>
                        {busy ? "Working…" : "Accept"}
                      </button>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
      }
