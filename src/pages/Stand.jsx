import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export default function Stand() {
  const { slug } = useParams(); // burada slug = owner_id
  const nav = useNavigate();

  const [loading, setLoading] = React.useState(true);
  const [err, setErr] = React.useState("");
  const [products, setProducts] = React.useState([]);

  async function load() {
    setLoading(true);
    setErr("");
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("owner_id", slug)
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(200);

      if (error) throw error;
      setProducts(data || []);
    } catch (e) {
      setErr(e?.message || "Load error");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    load();
  }, [slug]);

  return (
    <div style={page}>
      <div style={hero}>
        <div style={{ fontWeight: 900, fontSize: 18 }}>Verified Stand</div>
        <div style={{ opacity: 0.8, marginTop: 6 }}>{slug}</div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 12 }}>
          <button style={btn2} onClick={() => nav("/store")}>Back</button>
          <button style={btn} onClick={() => nav("/rfqs")}>Create RFQ</button>
        </div>
      </div>

      <div style={card}>
        <h3 style={{ margin: "0 0 10px 0" }}>Products</h3>

        {err ? <div style={errBox}><b>Hata:</b> {err}</div> : null}
        {loading ? <div>Loading…</div> : null}

        {!loading && products.length === 0 ? (
          <div style={{ opacity: 0.75 }}>(No products yet)</div>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            {products.map((p) => (
              <div key={p.id} style={row}>
                <div style={{ fontWeight: 900 }}>{p.title}</div>
                {p.description ? <div style={{ opacity: 0.85, marginTop: 6 }}>{p.description}</div> : null}
                <div style={{ opacity: 0.75, marginTop: 6 }}>
                  {p.price_amount != null ? `${p.price_amount} ${p.price_currency || ""}` : "RFQ"}
                </div>
                <button style={btn2} onClick={() => nav("/rfqs")}>RFQ</button>
              </div>
            ))}
          </div>
        )}

        <div style={{ marginTop: 14, opacity: 0.7 }}>
          TradePiGloball is not a party to transactions. (Showroom only)
        </div>
      </div>
    </div>
  );
}

const page = { padding: 16, maxWidth: 980, margin: "0 auto" };
const hero = { borderRadius: 18, padding: 16, marginBottom: 12, border: "1px solid rgba(255,255,255,.12)", background: "rgba(120,70,255,.12)" };
const card = { padding: 16, borderRadius: 16, border: "1px solid rgba(255,255,255,.12)", background: "rgba(0,0,0,.22)" };
const row = { padding: 12, borderRadius: 14, border: "1px solid rgba(255,255,255,.10)", background: "rgba(255,255,255,.03)" };
const btn = { padding: 12, borderRadius: 14, background: "#6d5cff", color: "white", border: "none", fontWeight: 900, cursor: "pointer" };
const btn2 = { padding: "10px 14px", borderRadius: 12, border: "1px solid rgba(255,255,255,.14)", background: "rgba(255,255,255,.06)", color: "white", fontWeight: 900, cursor: "pointer", width: "fit-content" };
const errBox = { marginTop: 12, padding: 12, borderRadius: 12, border: "1px solid rgba(255,0,0,.25)", background: "rgba(255,0,0,.06)" };
