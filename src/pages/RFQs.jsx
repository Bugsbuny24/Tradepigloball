import React from "react";
import { supabase } from "../lib/supabase";
import { getAuthDebug } from "../lib/debugAuth";

const CREDIT_COST = { RFQ_CREATE: 1 };

export default function RFQs() {
  const [title, setTitle] = React.useState("");
  const [desc, setDesc] = React.useState("");
  const [notes, setNotes] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const [items, setItems] = React.useState([]);
  const [credits, setCredits] = React.useState(null);

  // telefonda debug
  const [authDbg, setAuthDbg] = React.useState(null);

  function buildDescription(description, notesText) {
    const d = (description || "").trim();
    const n = (notesText || "").trim();
    if (!n) return d;
    return (d ? `${d}\n\n` : "") + `Notes: ${n}`;
  }

  async function loadRFQs() {
    const { data, error } = await supabase
      .from("rfqs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    if (!error) setItems(data || []);
  }

  async function loadCredits() {
    setCredits(null);

    // telefon debug
    const dbg = await getAuthDebug();
    setAuthDbg(dbg);

    if (!dbg?.userId) {
      setCredits(0);
      return;
    }

    // 1) önce RPC: rpc_wallet_me -> integer döndürür (balance)
    const { data: rpcBal, error: rpcErr } = await supabase.rpc("rpc_wallet_me");
    if (!rpcErr) {
      const bal = typeof rpcBal === "number" ? rpcBal : Number(rpcBal);
      setCredits(Number.isFinite(bal) ? bal : 0);
      return;
    }

    // 2) RPC yoksa / patladıysa fallback tablo: user_wallets.balance
    const { data: row, error: tErr } = await supabase
      .from("user_wallets")
      .select("balance")
      .eq("user_id", dbg.userId)
      .maybeSingle();

    if (!tErr && row) {
      setCredits(row.balance ?? 0);
      return;
    }

    // 3) ikisi de patladıysa 0 göster (en azından UI stabil)
    setCredits(0);
  }

  React.useEffect(() => {
    loadRFQs();
    loadCredits();

    // auth değişirse otomatik yenile
    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      loadCredits();
      loadRFQs();
    });

    return () => sub?.subscription?.unsubscribe?.();
  }, []);

  async function spendCreditForRFQ() {
    const { data, error } = await supabase.rpc("rpc_credit_spend", {
      p_action: "RFQ_CREATE",
      p_amount: CREDIT_COST.RFQ_CREATE,
      p_note: "rfq create",
    });

    if (error) throw error;

    const newBal = typeof data === "number" ? data : Number(data);
    if (!Number.isNaN(newBal)) setCredits(newBal);
  }

  async function onCreateRFQ() {
    setLoading(true);
    try {
      const dbg = await getAuthDebug();
      setAuthDbg(dbg);

      if (!dbg?.userId) {
        alert("Önce Login ol kanka.");
        return;
      }

      // 1) önce kredi düş
      await spendCreditForRFQ();

      // 2) sonra RFQ insert (NOT: rfqs tablosunda notes yoksa hata olmasın diye description içine gömüyoruz)
      const payload = {
        title: title || "Test RFQ",
        description: buildDescription(desc, notes),
      };

      const { error } = await supabase.from("rfqs").insert(payload);
      if (error) throw error;

      alert("RFQ created ✅");
      setTitle("");
      setDesc("");
      setNotes("");

      await loadRFQs();
      await loadCredits();
    } catch (e) {
      if (e?.code === "YETERSIZ_KREDI") return alert("Kredi bitti kanka 😄");
      if (e?.code === "NOT_AUTHENTICATED") return alert("Önce Login ol kanka.");
      alert(e?.message || "Hata");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: 16 }}>
      <h2>RFQs</h2>

      <div style={{ marginBottom: 10 }}>
        <b>Credits:</b> {credits === null ? "..." : credits}
      </div>

      <div style={dbgBox}>
        <b>Auth Debug (telefon)</b>
        <div>userId: {authDbg?.userId ?? "-"}</div>
        <div>email: {authDbg?.email ?? "-"}</div>
        <div>error: {authDbg?.error ?? "-"}</div>
      </div>

      <div>RFQ açmak <b>1 kredi</b> yer.</div>

      <div style={{ display: "grid", gap: 10, maxWidth: 520 }}>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          style={inp}
        />
        <textarea
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          placeholder="Description"
          style={txt}
        />
        <input
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Notes"
          style={inp}
        />

        <button onClick={onCreateRFQ} disabled={loading} style={btn}>
          {loading ? "Working..." : "Create RFQ (1 credit)"}
        </button>
      </div>

      <div style={{ marginTop: 18 }}>
        {items.length
          ? items.map((x) => (
              <div key={x.id} style={card}>
                <b>{x.title}</b>
                <div style={{ whiteSpace: "pre-wrap" }}>{x.description}</div>
              </div>
            ))
          : "No RFQs yet."}
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
const card = { padding: 12, marginTop: 8, borderRadius: 12, background: "rgba(0,0,0,.18)" };
const dbgBox = { margin: "12px 0", padding: 10, border: "1px dashed #555" };
