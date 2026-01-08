import React from "react";
import { supabase } from "../lib/supabase";
import { CREDIT_COST } from "../lib/credits";

export default function RFQs() {
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [notes, setNotes] = React.useState("");
  const [items, setItems] = React.useState([]);
  const [loading, setLoading] = React.useState(false);

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

  async function onCreateRFQ() {
    setLoading(true);

    try {
      // 1️⃣ KREDİ DÜŞ
      const { error: creditError } = await supabase.rpc(
        "rpc_credit_spend",
        {
          p_action: "RFQ_CREATE",
          p_amount: CREDIT_COST.RFQ_CREATE,
          p_note: "rfq create",
        }
      );

      if (creditError) throw creditError;

      // 2️⃣ RFQ INSERT
      const { error: insertError } = await supabase
        .from("rfqs")
        .insert({
          title: title || "Test RFQ",
          description: description || "",
          notes: notes || "",
        });

      if (insertError) throw insertError;

      alert("RFQ created ✅");

      setTitle("");
      setDescription("");
      setNotes("");

      await load();
    } catch (e) {
      if (e.code === "YETERSIZ_KREDI") {
        alert("Kredi bitti kanka 😄 Önce kredi alman lazım.");
        return;
      }

      if (e.code === "NOT_AUTHENTICATED") {
        alert("Önce login ol kanka.");
        return;
      }

      alert(e.message || "Hata");
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h2>RFQs</h2>

      <div style={{ opacity: 0.8, marginBottom: 12 }}>
        RFQ açmak <b>{CREDIT_COST.RFQ_CREATE}</b> kredi yer.
      </div>

      <div style={{ display: "grid", gap: 10, maxWidth: 520 }}>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          style={inp}
        />

        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description"
          style={txt}
        />

        <input
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Notes"
          style={inp}
        />

        <button
          onClick={onCreateRFQ}
          disabled={loading}
          style={btn}
        >
          {loading ? "Working..." : "Create RFQ (1 credit)"}
        </button>
      </div>

      <div style={{ marginTop: 18, opacity: 0.9 }}>
        {items.length ? (
          <div style={{ display: "grid", gap: 10 }}>
            {items.map((x) => (
              <div key={x.id} style={card}>
                <div style={{ fontWeight: 700 }}>{x.title}</div>
                {x.description && (
                  <div style={{ opacity: 0.85 }}>{x.description}</div>
                )}
                {x.notes && (
                  <div style={{ opacity: 0.7, fontSize: 13 }}>{x.notes}</div>
                )}
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

/* ================= styles ================= */

const inp = {
  padding: "12px",
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,.15)",
  background: "rgba(0,0,0,.2)",
  color: "white",
};

const txt = {
  ...inp,
  minHeight: 90,
  resize: "vertical",
};

const btn = {
  padding: "12px",
  borderRadius: 14,
  border: "1px solid rgba(255,255,255,.2)",
  background: "rgba(130,90,255,.45)",
  color: "white",
  cursor: "pointer",
};

const card = {
  padding: 14,
  borderRadius: 14,
  border: "1px solid rgba(255,255,255,.12)",
  background: "rgba(0,0,0,.18)",
};
