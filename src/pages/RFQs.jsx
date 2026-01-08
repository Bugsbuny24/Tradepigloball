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

  // telefonda debug göstergesi
  const [authDbg, setAuthDbg] = React.useState(null);

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
      setCredits(null);
      return;
    }

    // 1) önce RPC: rpc_wallet_me
    const { data: w, error: wErr } = await supabase.rpc("rpc_wallet_me");
    if (!wErr) {
      const n = typeof w === "number" ? w : Number(w);
      setCredits(Number.isFinite(n) ? n : 0);
      return;
    }

    // 2) fallback tablo: user_wallets.balance (mutlaka user_id ile filtrele)
    const { data: row, error: tErr } = await supabase
      .from("user_wallets")
      .select("balance")
      .eq("user_id", dbg.userId)
      .single();

    if (!tErr) {
      setCredits(row?.balance ?? 0);
      return;
    }

    setCredits(null);
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

    // rpc yeni balance döndürüyorsa anında UI güncelle
    const newBal = typeof data === "number" ? data : Number(data);
    if (!Number.isNaN(newBal)) setCredits(newBal);
  }

  async function insertRFQWithSafeFallback({ ownerId }) {
    // normal payload
    const payload = {
      owner_id: ownerId, // RLS ile güvenli hale getiriyoruz (aşağıda anlatıyorum)
      title: title || "Test RFQ",
      description: desc || "",
      notes: notes || "",
    };

    // 1) notes'lu dene
    let res = await supabase.from("rfqs").insert(payload);
    if (!res.error) return res;

    // 2) notes kolonu yoksa: notes'suz tekrar dene
    const msg = String(res.error?.message || "");
    if (msg.toLowerCase().includes("could not find the 'notes' column")) {
      const payload2 = {
        owner_id: ownerId,
        title: title || "Test RFQ",
        description: desc || "",
      };
      res = await supabase.from("rfqs").insert(payload2);
      if (!res.error) return res;
    }

    // hala error varsa fırlat
    throw res.error;
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

      // 1) önce kredi düş (düşmezse RFQ açılmaz)
      await spendCreditForRFQ();

      // 2) sonra RFQ insert
      await insertRFQWithSafeFallback({ ownerId: dbg.userId });

      alert("RFQ created ✅");
      setTitle("");
      setDesc("");
      setNotes("");

      await loadRFQs();
      await loadCredits();
    } catch (e) {
      const code = e?.code;

      if (code === "YETERSIZ_KREDI") {
        alert("Kredi bitti kanka 😄");
        return;
      }
      if (code === "NOT_AUTHENTICATED") {
        alert("Önce Login ol kanka.");
        return;
      }

      alert(e?.message || "Hata");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: 16 }}>
      <h2 style={{ marginTop: 0 }}>RFQs</h2>

      <div style={{ marginBottom: 10, opacity: 0.9 }}>
        <b>Credits:</b> {credits === null ? "..." : credits}
      </div>

      <div style={dbgBox}>
        <div style={{ fontWeight: 700, marginBottom: 6 }}>Auth Debug (telefon)</div>
        <div style={dbgLine}><b>userId:</b> {authDbg?.userId ?? "-"}</div>
        <div style={dbgLine}><b>email:</b> {authDbg?.email ?? "-"}</div>
        <div style={dbgLine}><b>error:</b> {authDbg?.error ?? "-"}</div>
      </div>

      <div style={{ opacity: 0.8, marginBottom: 12 }}>
        RFQ açmak <b>1 kredi</b> yer.
      </div>

      <div style={{ display: "grid", gap: 10, maxWidth: 520 }}>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" style={inp} />
        <textarea value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Description" style={txt} />
        <input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notes" style={inp} />

        <button onClick={onCreateRFQ} disabled={loading} style={btn}>
          {loading ? "Working..." : "Create RFQ (1 credit)"}
        </button>
      </div>

      <div style={{ marginTop: 18 }}>
        {items.length
          ? items.map((x) => (
              <div key={x.id} style={card}>
                <b>{x.title}</b>
                {x.description ? <div>{x.description}</div> : null}
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
const btn = { padding: 12, borderRadius: 14, background: "#6d5cff", color: "white", border: "none" };
const card = { padding: 12, marginTop: 8, borderRadius: 12, background: "rgba(0,0,0,.18)" };
const dbgBox = { margin: "12px 0", padding: 10, border: "1px dashed #555" };
const dbgLine = { opacity: 0.9, marginBottom: 4 };
