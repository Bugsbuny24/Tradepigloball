import React from "react";
import { supabase } from "../lib/supabaseClient";
import { getAuthDebug } from "../lib/debugAuth";
import { spendCredit } from "../lib/credits";

export default function Products() {
  const [title, setTitle] = React.useState("");
  const [desc, setDesc] = React.useState("");
  const [price, setPrice] = React.useState(""); // numeric string
  const [currency, setCurrency] = React.useState("PI"); // istersen USD vs
  const [loading, setLoading] = React.useState(false);
  const [items, setItems] = React.useState([]);
  const [credits, setCredits] = React.useState(null);
  const [authDbg, setAuthDbg] = React.useState(null);

  async function load() {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    if (!error) setItems(data || []);
  }

  async function loadCredits() {
    const dbg = await getAuthDebug();
    setAuthDbg(dbg);
    if (!dbg?.userId) return setCredits(0);
    const { data } = await supabase.rpc("rpc_wallet_me"); // sende varsa
    if (typeof data === "number") setCredits(data);
  }

  React.useEffect(() => {
    (async () => {
      await load();
      await loadCredits();
    })();
  }, []);

  async function onCreate() {
    const dbg = await getAuthDebug();
    setAuthDbg(dbg);
    if (!dbg?.userId) return alert("Önce login ol kanka.");

    const p = price === "" ? null : Number(price);
    if (price !== "" && !Number.isFinite(p)) return alert("Price sayı olmalı kanka.");

    setLoading(true);
    try {
      // 1 kredi yak (senin sistemin)
      await spendCredit("PRODUCT_CREATE", 1, "product create");

      const { error } = await supabase.from("products").insert({
        owner_id: dbg.userId,
        title: title || "Product",
        description: desc || "",
        price_amount: p,
        price_currency: currency || null,
      });

      if (error) throw error;

      setTitle("");
      setDesc("");
      setPrice("");
      await load();
      await loadCredits();
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
        <div style={{ marginTop: 6 }}><b>Credits:</b> {credits === null ? "..." : credits}</div>
        <div style={{ opacity: 0.75, marginTop: 6 }}>Ürün eklemek 1 kredi yer.</div>
      </div>

      <div style={{ display: "grid", gap: 10, maxWidth: 520 }}>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" style={inp} />
        <textarea value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Description" style={txt} />
        <input value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Price (optional)" style={inp} />
        <input value={currency} onChange={(e) => setCurrency(e.target.value)} placeholder="Currency (PI)" style={inp} />

        <button onClick={onCreate} disabled={loading} style={btn}>
          {loading ? "Working..." : "Create Product (1 credit)"}
        </button>
      </div>

      <div style={{ marginTop: 18 }}>
        {items.length ? (
          items.map((x) => (
            <div key={x.id} style={card}>
              <b>{x.title ?? "Product"}</b>
              {x.price_amount != null ? (
                <div style={{ marginTop: 6, opacity: 0.9 }}>
                  Price: {x.price_amount} {x.price_currency ?? ""}
                </div>
              ) : null}
              <div style={{ opacity: 0.9, marginTop: 6, whiteSpace: "pre-wrap" }}>{x.description}</div>
            </div>
          ))
        ) : (
          <div style={{ opacity: 0.8 }}>No products yet.</div>
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
const btn = { padding: 12, borderRadius: 14, background: "#6d5cff", color: "white", border: "none", fontWeight: 800 };
const card = { padding: 12, marginTop: 10, borderRadius: 12, background: "rgba(0,0,0,.18)" };
const dbgBox = { margin: "12px 0", padding: 10, border: "1px dashed #555", borderRadius: 12 };
