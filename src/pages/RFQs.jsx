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
    const d = String(description || "").trim();
    const n = String(notesText || "").trim();
    if (!n) return d;
    return (d ? d + "\n\n" : "") + `Notes: ${n}`;
  }

  function isMissingNotesColumnError(err) {
    const msg = String(err?.message || err || "").toLowerCase();
    return msg.includes("could not find") && msg.includes("notes") && msg.includes("schema cache");
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

    const dbg = await getAuthDebug();
    setAuthDbg(dbg);

    if (!dbg?.userId) {
      setCredits(0);
      return;
    }

    // 1) önce RPC: rpc_wallet_me() -> balance döndürür
    const { data: rpcBal, error: rpcErr } = await supabase.rpc("rpc_wallet_me");
    if (!rpcErr) {
      const bal = typeof rpcBal === "number" ? rpcBal : Number(rpcBal);
      setCredits(Number.isFinite(bal) ? bal : 0);
      return;
    }

    // 2) fallback: user_wallets.balance
    const { data: row, error: tErr } = await supabase
      .from("user_wallets")
      .select("balance")
      .eq("user_id", dbg.userId)
      .maybeSingle();

    if (!tErr && row) {
      setCredits(row?.balance ?? 0);
      return;
    }

    // 3) en kötü 0
    setCredits(0);
  }

  React.useEffect(() => {
    loadRFQs();
    loadCredits();

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
    if (Number.isFinite(newBal)) setCredits(newBal);
  }

  async function insertRFQWithFallback(userId) {
    // normal insert (buyer_id + notes)
    const payload1 = {
      buyer_id: userId,
      title: title || "Test RFQ",
      description: desc || "",
      notes: notes || "",
      status: "open",
    };

    const r1 = await supabase.from("rfqs").insert(payload1);
    if (!r1.error) return;

    // notes schema-cache / kolon yok hatası -> notes'i description içine gömüp tekrar dene
    if (!isMissingNotesColumnError(r1.error)) throw r1.error;

    const payload2 = {
      buyer_id: userId,
      title: title || "Test RFQ",
      description: buildDescription(desc, notes),
      status: "open",
    };

    const r2 = await supabase.from("rfqs").insert(payload2);
    if (r2.error) throw r2.error;
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

      // 2) sonra RFQ insert (owner_id yok, buyer_id var)
      await insertRFQWithFallback(dbg.userId);

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

      <div>
        RFQ açmak <b>1 kredi</b> yer.
      </div>

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
        {items.length ? (
          items.map((x) => (
            <div key={x.id} style={card}>
              <b>{x.title}</b>
              <div style={{ whiteSpace: "pre-wrap" }}>{x.description}</div>
              {x.notes ? (
                <div style={{ whiteSpace: "pre-wrap", marginTop: 6 }}>
                  {"\n"}Notes: {x.notes}
                </div>
              ) : null}
            </div>
          ))
        ) : (
          "No RFQs yet."
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
const btn = {
  padding: 12,
  borderRadius: 14,
  background: "#6d5cff",
  color: "white",
  border: "none",
};
const card = {
  padding: 12,
  marginTop: 8,
  borderRadius: 12,
  background: "rgba(0,0,0,.18)",
};
const dbgBox = { margin: "12px 0", padding: 10, border: "1px dashed #555" };
