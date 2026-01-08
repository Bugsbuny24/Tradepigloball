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

    // auth debug: ekrana basalım (PC console gerekmiyor)
    const dbg = await getAuthDebug();
    setAuthDbg(dbg);

    // Login yoksa zaten credits çekemeyiz
    if (!dbg?.userId) {
      setCredits(null);
      return;
    }

    // 1) RPC ile dene: rpc_wallet_me()
    const { data: w, error: wErr } = await supabase.rpc("rpc_wallet_me");

    if (!wErr) {
      setCredits(typeof w === "number" ? w : Number(w) || 0);
      return;
    }

    // 2) RPC yoksa tablo fallback: user_wallets.balance
    const { data: row, error: tErr } = await supabase
      .from("user_wallets")
      .select("balance")
      .single();

    if (!tErr) {
      setCredits(row?.balance ?? 0);
      return;
    }

    // 3) ikisi de patladıysa null bırak
    setCredits(null);
  }

  React.useEffect(() => {
    loadRFQs();
    loadCredits();

    // auth değişirse otomatik yenile
    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      loadCredits();
      loadRFQs();
    });

    return () => {
      sub?.subscription?.unsubscribe?.();
    };
  }, []);

  async function spendCreditForRFQ() {
    // rpc_credit_spend param isimleri sende p_action / p_amount / p_note
    const { data, error } = await supabase.rpc("rpc_credit_spend", {
      p_action: "RFQ_CREATE",
      p_amount: CREDIT_COST.RFQ_CREATE,
      p_note: "rfq create",
    });

    if (error) throw error;

    // function yeni balance döndürüyorsa kullan
    const newBal = typeof data === "number" ? data : Number(data);
    if (!Number.isNaN(newBal)) setCredits(newBal);
  }

  async function onCreateRFQ() {
    setLoading(true);
    try {
      // 0) login kontrolünü ekranda da göreceğiz
      const dbg = await getAuthDebug();
      setAuthDbg(dbg);

      if (!dbg?.userId) {
        alert("Önce Login ol kanka.");
        return;
      }

      // 1) önce kredi düş
      await spendCreditForRFQ();

      // 2) sonra RFQ insert (kredi düşmezse ASLA açılmayacak)
      const { error } = await supabase.from("rfqs").insert({
        title: title || "Test RFQ",
        description: desc || "",
        notes: notes || "",
      });

      if (error) throw error;

      alert("RFQ created ✅");
      setTitle("");
      setDesc("");
      setNotes("");

      await loadRFQs();
      await loadCredits();
    } catch (e) {
      const code = e?.code;

      if (code === "YETERSIZ_KREDI") {
        alert("Kredi bitti kanka 😄 Önce kredi alman lazım.");
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

      {/* Credits */}
      <div style={{ marginBottom: 10, opacity: 0.9 }}>
        <b>Credits:</b>{" "}
        {credits === null ? (
          <span>...</span>
        ) : (
          <span>{credits}</span>
        )}
      </div>

      {/* Telefon debug paneli (PC console yok, burası console) */}
      <div style={dbgBox}>
        <div style={{ fontWeight: 700, marginBottom: 6 }}>Auth Debug (telefon)</div>
        <div style={dbgLine}>
          <b>hasSession:</b> {String(authDbg?.hasSession ?? "-")}
        </div>
        <div style={dbgLine}>
          <b>sessionUserId:</b> {authDbg?.sessionUserId ?? "-"}
        </div>
        <div style={dbgLine}>
          <b>userId:</b> {authDbg?.userId ?? "-"}
        </div>
        <div style={dbgLine}>
          <b>email:</b> {authDbg?.email ?? "-"}
        </div>
        <div style={dbgLine}>
          <b>error:</b> {authDbg?.error ?? "-"}
        </div>
      </div>

      <div style={{ opacity: 0.8, marginBottom: 12 }}>
        RFQ açmak <b>1 kredi</b> yer.
      </div>

      {/* Form */}
      <div style={{ display: "grid", gap: 10, maxWidth: 520 }}>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" style={inp} />
        <textarea value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Description" style={txt} />
        <input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notes" style={inp} />

        <button onClick={onCreateRFQ} disabled={loading} style={btn}>
          {loading ? "Working..." : "Create RFQ (1 credit)"}
        </button>
      </div>

      {/* List */}
      <div style={{ marginTop: 18, opacity: 0.95 }}>
        {items?.length ? (
          <div style={{ display: "grid", gap: 10 }}>
            {items.map((x) => (
              <div key={x.id} style={card}>
                <div style={{ fontWeight: 800 }}>{x.title}</div>
                {x.description ? <div style={{ opacity: 0.85 }}>{x.description}</div> : null}
                {x.notes ? <div style={{ opacity: 0.7, fontSize: 13 }}>{x.notes}</div> : null}
              </div>
            ))}
          </div>
        ) : (
          <div>No RFQs yet.</div>
        )}
      </div>

      {/* disclaimer */}
      <div style={{ marginTop: 16, opacity: 0.65, fontSize: 12 }}>
        Disclaimer: TradePiGloball is a showroom + RFQ platform only. We are not a party to any transaction, payment,
        delivery, refund, or dispute. All agreements and liabilities belong solely to users.
      </div>
    </div>
  );
}

const inp = {
  padding: "12px 12px",
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,.12)",
  background: "rgba(0,0,0,.18)",
  color: "white",
  outline: "none",
};

const txt = {
  ...inp,
  minHeight: 90,
  resize: "vertical",
};

const btn = {
  padding: "12px 12px",
  borderRadius: 14,
  border: "1px solid rgba(255,255,255,.12)",
  background: "rgba(130,90,255,.45)",
  color: "white",
  cursor: "pointer",
  fontWeight: 700,
};

const card = {
  padding: 12,
  borderRadius: 14,
  border: "1px solid rgba(255,255,255,.12)",
  background: "rgba(0,0,0,.18)",
};

const dbgBox = {
  marginBottom: 14,
  padding: 12,
  borderRadius: 14,
  border: "1px dashed rgba(255,255,255,.25)",
  background: "rgba(0,0,0,.12)",
  maxWidth: 520,
};

const dbgLine = {
  fontSize: 12,
  opacity: 0.9,
  marginBottom: 4,
};
