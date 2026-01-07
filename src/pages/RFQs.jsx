import React from "react";
import { supabase } from "../lib/supabase";
import { creditSpend, CREDIT_COST } from "../lib/credits";

export default function RFQs() {
  const [title, setTitle] = React.useState("");
  const [desc, setDesc] = React.useState("");
  const [notes, setNotes] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [items, setItems] = React.useState([]);

  async function load() {
    const { data, error } = await supabase
      .from("rfqs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    if (!error) setItems(data || []);
  }

  React.useEffect(() => {
    load();
  }, []);

  async function onCreateRfQ() {
    setLoading(true);
    try {
      // 1) kredi düş
      await creditSpend("RFQ_CREATE", CREDIT_COST.RFQ_CREATE, "Create RFQ");

      // 2) insert RFQ
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
      await load();
    } catch (e) {
      if (e?.code === "YETERSIZ_KREDI") {
        alert("Kredi bitti kanka 😅 Önce kredi alman lazım.");
        return;
      }
      if (e?.code === "NOT_AUTHENTICATED") {
        alert("Önce Login ol kanka.");
        return;
      }
      alert(e?.message || "Hata");
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h2 style={{ marginTop: 0 }}>RFQs</h2>
      <div style={{ opacity: 0.8, marginBottom: 12 }}>
        RFQ açmak <b>1 kredi</b> yer.
      </div>

      <div style={{ display: "grid", gap: 10, maxWidth: 520 }}>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" style={inp} />
        <textarea value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Description" style={txt} />
        <input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notes" style={inp} />

        <button onClick={onCreateRfQ} disabled={loading} style={btn}>
          {loading ? "Working..." : "Create RFQ (1 credit)"}
        </button>
      </div>

      <div style={{ marginTop: 18, opacity: 0.85 }}>
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
const txt = { ...inp, minHeight: 90, resize: "vertical" };
const btn = {
  padding: "12px 12px",
  borderRadius: 14,
  border: "1px solid rgba(255,255,255,.12)",
  background: "rgba(130,90,255,.45)",
  color: "white",
  cursor: "pointer",
  fontWeight: 800,
};
const card = {
  padding: 12,
  borderRadius: 14,
  border: "1px solid rgba(255,255,255,.10)",
  background: "rgba(0,0,0,.14)",
};
