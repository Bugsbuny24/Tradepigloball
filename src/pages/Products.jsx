import React from "react";
import { supabase } from "../lib/supabaseClient";
import { getAuthDebug } from "../lib/debugAuth";

const COST = { PRODUCT_CREATE: 1 };

export default function Products() {
  const [authDbg, setAuthDbg] = React.useState(null);

  const [tab, setTab] = React.useState("browse"); // browse | mine
  const [loading, setLoading] = React.useState(true);
  const [err, setErr] = React.useState("");

  const [items, setItems] = React.useState([]);
  const [mine, setMine] = React.useState([]);

  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [price, setPrice] = React.useState("");
  const [currency, setCurrency] = React.useState("PI");

  async function load() {
    setLoading(true);
    setErr("");
    try {
      const dbg = await getAuthDebug();
      setAuthDbg(dbg);

      const pub = await supabase
        .from("products")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(100);
      if (pub.error) throw pub.error;
      setItems(pub.data || []);

      if (dbg?.userId) {
        const my = await supabase
          .from("products")
          .select("*")
          .eq("owner_id", dbg.userId)
          .order("created_at", { ascending: false })
          .limit(200);
        if (!my.error) setMine(my.data || []);
      } else {
        setMine([]);
      }
    } catch (e) {
      setErr(e?.message || "Load error");
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    load();
    const { data: sub } = supabase.auth.onAuthStateChange(() => load());
    return () => sub?.subscription?.unsubscribe?.();
  }, []);

  async function spendProductCredit() {
    // Ürün eklemeyi ücretli yapmak istiyorsan bu açık kalsın
    const { error } = await supabase.rpc("rpc_credit_spend", {
      p_action: "PRODUCT_CREATE",
      p_amount: COST.PRODUCT_CREATE,
      p_note: "product create",
    });
    if (error) throw error;
  }

  async function createProduct() {
    setErr("");
    try {
      const dbg = await getAuthDebug();
      setAuthDbg(dbg);
      if (!dbg?.userId) throw new Error("Önce Login ol kanka.");

      if (!title.trim()) throw new Error("Title required");
      const p = price.trim() ? Number(price) : null;
      if (price.trim() && (!Number.isFinite(p) || p < 0)) throw new Error("Invalid price");

      // 1) kredi düş (istersen kaldır)
      await spendProductCredit();

      // 2) insert
      const ins = await supabase.from("products").insert({
        owner_id: dbg.userId,
        title: title.trim(),
        description: description.trim() || null,
        price_amount: p,
        price_currency: currency || "PI",
        is_active: true,
      });
      if (ins.error) throw ins.error;

      setTitle("");
      setDescription("");
      setPrice("");
      await load();
      setTab("mine");
    } catch (e) {
      setErr(e?.message || "Create error");
    }
  }

  return (
    <div style={page}>
      <div style={card}>
        <h2 style={{ margin: 0 }}>PI MODE • Products</h2>

        <div style={dbgBox}>
          <b>Auth Debug</b>
          <div>userId: {authDbg?.userId ?? "-"}</div>
          <div>email: {authDbg?.email ?? "-"}</div>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 10 }}>
          <button style={tabBtn(tab === "browse")} onClick={() => setTab("browse")}>Browse</button>
          <button style={tabBtn(tab === "mine")} onClick={() => setTab("mine")}>My Products</button>
          <button style={btn2} onClick={load}>Refresh</button>
        </div>

        {err ? <div style={errBox}><b>Hata:</b> {err}</div> : null}
        {loading ? <div style={{ marginTop: 12 }}>Loading…</div> : null}

        {!loading && tab === "browse" ? (
          <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
            {items.length === 0 ? (
              <div style={{ opacity: 0.75 }}>No products yet.</div>
            ) : (
              items.map((p) => (
                <div key={p.id} style={row}>
                  <div style={{ fontWeight: 900 }}>{p.title}</div>
                  {p.description ? <div style={{ opacity: 0.85, marginTop: 6 }}>{p.description}</div> : null}
                  <div style={{ opacity: 0.75, marginTop: 6 }}>
                    Price: {p.price_amount != null ? `${p.price_amount} ${p.price_currency || ""}` : "RFQ"}
                  </div>
                  <div style={{ opacity: 0.65, marginTop: 6, fontSize: 12 }}>
                    Stand: <a style={{ color: "white" }} href={`/stand/${p.owner_id}`}>/stand/{p.owner_id}</a>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : null}

        {!loading && tab === "mine" ? (
          <div style={{ marginTop: 12 }}>
            <div style={{ padding: 12, borderRadius: 12, background: "rgba(255,255,255,.04)" }}>
              <h3 style={{ margin: "0 0 10px 0" }}>Add Product (1 credit)</h3>
              <div style={{ display: "grid", gap: 10, maxWidth: 520 }}>
                <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" style={inp} />
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" style={{ ...inp, minHeight: 90 }} />
                <input value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Price (optional)" style={inp} />
                <select value={currency} onChange={(e) => setCurrency(e.target.value)} style={inp}>
                  <option value="PI">PI</option>
                  <option value="USD" disabled>USD (disabled)</option>
                </select>

                <button style={btn} onClick={createProduct}>Create</button>
              </div>
            </div>

            <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
              {mine.length === 0 ? (
                <div style={{ opacity: 0.75 }}>No products yet.</div>
              ) : (
                mine.map((p) => (
                  <div key={p.id} style={row}>
                    <div style={{ fontWeight: 900 }}>{p.title}</div>
                    <div style={{ opacity: 0.75, marginTop: 6 }}>
                      {p.price_amount != null ? `${p.price_amount} ${p.price_currency || ""}` : "RFQ"}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : null}

        <div style={{ marginTop: 14, opacity: 0.7 }}>
          TradePiGloball is not a party to transactions (showroom only).
        </div>
      </div>
    </div>
  );
}

const page = { padding: 16, maxWidth: 980, margin: "0 auto" };
const card = { padding: 16, borderRadius: 16, border: "1px solid rgba(255,255,255,.12)", background: "rgba(0,0,0,.22)" };
const dbgBox = { marginTop: 12, padding: 10, border: "1px dashed #555", borderRadius: 12 };
const row = { padding: 12, borderRadius: 14, border: "1px solid rgba(255,255,255,.10)", background: "rgba(255,255,255,.03)" };
const inp = { padding: 12, borderRadius: 12, background: "rgba(0,0,0,.18)", color: "white", border: "1px solid rgba(255,255,255,.12)" };
const btn = { padding: 12, borderRadius: 14, background: "#6d5cff", color: "white", border: "none", fontWeight: 900, cursor: "pointer" };
const btn2 = { padding: "10px 14px", borderRadius: 12, border: "1px solid rgba(255,255,255,.14)", background: "rgba(255,255,255,.06)", color: "white", fontWeight: 900, cursor: "pointer" };
const tabBtn = (active) => ({
  padding: "10px 14px",
  borderRadius: 12,
  border: active ? "1px solid rgba(160,120,255,.55)" : "1px solid rgba(255,255,255,.14)",
  background: active ? "rgba(120,70,255,.22)" : "rgba(255,255,255,.06)",
  color: "white",
  fontWeight: 900,
  cursor: "pointer",
});
const errBox = { marginTop: 12, padding: 12, borderRadius: 12, border: "1px solid rgba(255,0,0,.25)", background: "rgba(255,0,0,.06)" };
