// src/pages/Products.jsx
import React from "react";
import { supabase } from "../lib/supabaseClient";
import { getAuthDebug } from "../lib/debugAuth";

export default function Products() {
  const [name, setName] = React.useState("");
  const [desc, setDesc] = React.useState("");
  const [pricePi, setPricePi] = React.useState("");

  const [loading, setLoading] = React.useState(false);
  const [items, setItems] = React.useState([]);

  const [authDbg, setAuthDbg] = React.useState(null);

  async function load() {
    const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: false }).limit(50);
    if (!error) setItems(data || []);
  }

  React.useEffect(() => {
    (async () => {
      const dbg = await getAuthDebug();
      setAuthDbg(dbg);
      await load();
    })();
  }, []);

  async function onCreate() {
    const dbg = await getAuthDebug();
    setAuthDbg(dbg);

    if (!dbg?.userId) return alert("Önce Login ol kanka.");

    const n = Number(String(pricePi).replace(",", "."));
    if (!Number.isFinite(n) || n <= 0) return alert("Price (Pi) zorunlu, 0'dan büyük sayı gir.");

    setLoading(true);
    try {
      const payload = {
        owner_id: dbg.userId,
        name: name || "Product",
        description: desc || "",
        price_pi: n,
      };

      const { error } = await supabase.from("products").insert(payload);
      if (error) throw error;

      setName("");
      setDesc("");
      setPricePi("");

      await load();
      alert("Product created ✅");
    } catch (e) {
      alert(e?.message || "Hata");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: 16 }}>
      <h2>Products</h2>

      <div style={dbgBox}>
        <b>Auth Debug</b>
        <div>userId: {authDbg?.userId ?? "-"}</div>
        <div>email: {authDbg?.email ?? "-"}</div>
      </div>

      <div style={{ display: "grid", gap: 10, maxWidth: 520 }}>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" style={inp} />
        <textarea value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Description" style={txt} />
        <input value={pricePi} onChange={(e) => setPricePi(e.target.value)} placeholder="Price (Pi)" style={inp} />

        <button onClick={onCreate} disabled={loading} style={btn}>
          {loading ? "Working..." : "Create Product"}
        </button>
      </div>

      <div style={{ marginTop: 18 }}>
        {items?.length ? (
          items.map((x) => (
            <div key={x.id} style={card}>
              <b>{x.name ?? "Product"}</b>
              <div style={{ whiteSpace: "pre-wrap", opacity: 0.9, marginTop: 6 }}>{x.description}</div>
              <div style={{ marginTop: 8, opacity: 0.8 }}>
                price_pi: <b>{x.price_pi ?? "-"}</b>
              </div>
            </div>
          ))
        ) : (
          <div>No products yet.</div>
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
const btn = { padding: 12, borderRadius: 14, background: "#6d5cff", color: "white" };
const card = { padding: 12, marginTop: 10, borderRadius: 12, background: "rgba(0,0,0,.18)" };
const dbgBox = { margin: "12px 0", padding: 10, border: "1px dashed #555", borderRadius: 12 };
