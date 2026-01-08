import React from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export default function Store() {
  const nav = useNavigate();
  const [loading, setLoading] = React.useState(true);
  const [err, setErr] = React.useState("");
  const [stands, setStands] = React.useState([]);

  async function load() {
    setLoading(true);
    setErr("");
    try {
      // Stand = product owner listesi (en basit, rolesuz)
      const { data, error } = await supabase
        .from("products")
        .select("owner_id, created_at")
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(300);

      if (error) throw error;

      const unique = Array.from(new Set((data || []).map((x) => x.owner_id)))
        .filter(Boolean)
        .slice(0, 80)
        .map((owner_id) => ({ owner_id }));

      setStands(unique);
    } catch (e) {
      setErr(e?.message || "Load error");
      setStands([]);
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    load();
  }, []);

  return (
    <div style={page}>
      <div style={card}>
        <h2 style={{ margin: 0 }}>Stands</h2>
        <div style={{ opacity: 0.75, marginTop: 6 }}>Vitrin = ürün sahibi kullanıcı vitrini.</div>

        {err ? <div style={errBox}><b>Hata:</b> {err}</div> : null}
        {loading ? <div style={{ marginTop: 12 }}>Loading…</div> : null}

        {!loading && stands.length === 0 ? (
          <div style={{ marginTop: 12, opacity: 0.75 }}>No stands yet. (Önce ürün ekleyin)</div>
        ) : null}

        <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
          {stands.map((s) => (
            <div key={s.owner_id} style={row}>
              <div style={{ fontWeight: 900 }}>Stand</div>
              <div style={{ opacity: 0.75, marginTop: 6 }}>{s.owner_id}</div>
              <button style={btn2} onClick={() => nav(`/stand/${s.owner_id}`)}>View Stand</button>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 14, opacity: 0.7 }}>
          TradePiGloball is not a party to transactions (showroom only).
        </div>
      </div>
    </div>
  );
}

const page = { padding: 16, maxWidth: 980, margin: "0 auto" };
const card = { padding: 16, borderRadius: 16, border: "1px solid rgba(255,255,255,.12)", background: "rgba(0,0,0,.22)" };
const row = { padding: 12, borderRadius: 14, border: "1px solid rgba(255,255,255,.10)", background: "rgba(255,255,255,.03)", display: "grid", gap: 10 };
const btn2 = { padding: "10px 14px", borderRadius: 12, border: "1px solid rgba(255,255,255,.14)", background: "rgba(255,255,255,.06)", color: "white", fontWeight: 900, cursor: "pointer", width: "fit-content" };
const errBox = { marginTop: 12, padding: 12, borderRadius: 12, border: "1px solid rgba(255,0,0,.25)", background: "rgba(255,0,0,.06)" };
