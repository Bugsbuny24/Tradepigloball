import React from "react";
import { supabase } from "../lib/supabaseClient";
import { creditMe, creditSpend, CREDIT_COST } from "../lib/credits";

export default function RFQs() {
  const [title, setTitle] = React.useState("");
  const [desc, setDesc] = React.useState("");
  const [notes, setNotes] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const [items, setItems] = React.useState([]);
  const [credits, setCredits] = React.useState(null);

  async function load() {
    const { data, error } = await supabase
      .from("rfqs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    if (!error) setItems(data || []);
  }

  async function refreshCredits() {
    try {
      const c = await creditMe();
      setCredits(c);
    } catch (e) {
      // login değilse vs.
      setCredits(null);
    }
  }

  React.useEffect(() => {
    load();
    refreshCredits();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onCreateRFQ() {
    setLoading(true);
    try {
      // 1) Kredi düş (başarısızsa RFQ ASLA açılmasın)
      await creditSpend("RFQ_CREATE", CREDIT_COST.RFQ_CREATE, "Create RFQ");

      // 2) RFQ insert
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
      await refreshCredits();
    } catch (e) {
      const code = e?.code || "";
      if (code.includes("YETERSIZ_KREDI")) {
        alert("Kredi bitti kanka 😄 Önce kredi alman lazım.");
        return;
      }
      if (code.includes("NOT_AUTHENTICATED") || (e?.message || "").includes("NOT_AUTHENTICATED")) {
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

      <div style={card}>
        <div style={{ fontWeight: 800, marginBottom: 10 }}>
          Credits:{" "}
          <span style={{ color: "rgba(180,255,180,.95)" }}>
            {credits === null ? "..." : credits}
          </span>
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
            style={{ ...inp, minHeight: 90, resize: "vertical" }}
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

        <div style={{ marginTop: 18, opacity: 0.85 }}>
          {items?.length ? (
            <div style={{ display: "grid", gap: 10 }}>
              {items.map((x) => (
                <div key={x.id} style={row}>
                  <div style={{ fontWeight: 900 }}>{x.title}</div>
                  {x.description ? (
                    <div style={{ opacity: 0.85, marginTop: 4 }}>{x.description}</div>
                  ) : null}
                  {x.notes ? (
                    <div style={{ opacity: 0.7, marginTop: 6, fontSize: 13 }}>{x.notes}</div>
                  ) : null}
                </div>
              ))}
            </div>
          ) : (
            <div>No RFQs yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}

const card = {
  padding: 16,
  borderRadius: 14,
  background: "rgba(255,255,255,.06)",
  border: "1px solid rgba(255,255,255,.10)",
};

const row = {
  padding: 14,
  borderRadius: 14,
  background: "rgba(0,0,0,.18)",
  border: "1px solid rgba(255,255,255,.08)",
};

const inp = {
  padding: "12px 12px",
  borderRadius: 14,
  border: "1px solid rgba(255,255,255,.12)",
  background: "rgba(0,0,0,.22)",
  color: "white",
  outline: "none",
};

const btn = {
  padding: "12px 12px",
  borderRadius: 14,
  border: "1px solid rgba(255,255,255,.12)",
  background: "rgba(130,90,255,.45)",
  color: "white",
  fontWeight: 900,
  cursor: "pointer",
};
