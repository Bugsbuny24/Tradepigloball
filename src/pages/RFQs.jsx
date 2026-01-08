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

  // ✅ tek gerçek kaynak: user_wallets.balance
  async function fetchBalance() {
    const dbg = await getAuthDebug();
    setAuthDbg(dbg);

    if (!dbg?.userId) return 0;

    const { data, error } = await supabase
      .from("user_wallets")
      .select("balance")
      .eq("user_id", dbg.userId)
      .single();

    if (error) return 0;
    return data?.balance ?? 0;
  }

  React.useEffect(() => {
    loadRFQs();
    fetchBalance().then(setCredits);

    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      fetchBalance().then(setCredits);
      loadRFQs();
    });

    return () => sub?.subscription?.unsubscribe?.();
  }, []);

  async function spendCreditForRFQ() {
    const { error } = await supabase.rpc("rpc_credit_spend", {
      p_action: "RFQ_CREATE",
      p_amount: CREDIT_COST.RFQ_CREATE,
      p_note: "rfq create",
    });

    if (error) throw error;
    // ❌ burada setCredits yok
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

      // 1️⃣ önce kredi düş (kredi düşmezse RFQ açılmaz)
      await spendCreditForRFQ();

      // 2️⃣ sonra RFQ insert
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

      // 3️⃣ en sonda krediyi DB’den yeniden çek
      setCredits(await fetchBalance());
    } catch (e) {
      if (e?.code === "YETERSIZ_KREDI") {
        alert("Kredi bitti kanka 😄");
        return;
      }
      if (e?.code === "NOT_AUTHENTICATED") {
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
