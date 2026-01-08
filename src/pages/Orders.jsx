import React from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { getAuthDebug } from "../lib/debugAuth";

export default function Orders() {
  const nav = useNavigate();
  const [authDbg, setAuthDbg] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [err, setErr] = React.useState("");
  const [rows, setRows] = React.useState([]);
  const [q, setQ] = React.useState("");
  const [mineOnly, setMineOnly] = React.useState(true);

  async function load() {
    setLoading(true);
    setErr("");

    try {
      const dbg = await getAuthDebug();
      setAuthDbg(dbg);

      if (!dbg?.userId) {
        setRows([]);
        setErr("Not authenticated. Login ol kanka.");
        return;
      }

      // RLS: orders_select_party policy varsa zaten sadece tarafı olduğu orderlar gelir.
      let query = supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);

      // ekstra filtre istersen:
      if (mineOnly) {
        // RLS zaten party yapıyor ama garanti olsun
        // (Supabase OR filter string)
        query = query.or(`buyer_id.eq.${dbg.userId},seller_id.eq.${dbg.userId}`);
      }

      const { data, error } = await query;
      if (error) throw error;

      const list = data || [];
      const s = q.trim().toLowerCase();
      const filtered = !s ? list : list.filter((r) => JSON.stringify(r).toLowerCase().includes(s));

      setRows(filtered);
    } catch (e) {
      setErr(e?.message || "Load error");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    load();
    const { data: sub } = supabase.auth.onAuthStateChange(() => load());
    return () => sub?.subscription?.unsubscribe?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{ padding: 16, maxWidth: 1100, margin: "0 auto" }}>
      <h2 style={{ margin: 0 }}>Orders</h2>
      <div style={{ opacity: 0.75, marginTop: 6 }}>
        Buyer/Seller olarak taraf olduğun order’lar.
      </div>

      <div style={dbgBox}>
        <b>Auth Debug</b>
        <div>userId: {authDbg?.userId ?? "-"}</div>
        <div>email: {authDbg?.email ?? "-"}</div>
      </div>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 10 }}>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search (id, rfq_id, status...)"
          style={inp}
        />
        <label style={{ display: "flex", gap: 8, alignItems: "center", opacity: 0.9 }}>
          <input
            type="checkbox"
            checked={mineOnly}
            onChange={(e) => setMineOnly(e.target.checked)}
          />
          Mine only
        </label>
        <button onClick={load} style={btn2}>Refresh</button>
      </div>

      {err ? <div style={errBox}><b>Hata:</b> {err}</div> : null}
      {loading ? <div style={{ marginTop: 12, opacity: 0.8 }}>Loading…</div> : null}

      {!loading ? (
        <div style={{ marginTop: 12, overflowX: "auto", border: "1px solid rgba(255,255,255,.10)", borderRadius: 12 }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["id", "rfq_id", "offer_id", "buyer_id", "seller_id", "amount_pi", "status", "created_at", "actions"].map((h) => (
                  <th key={h} style={th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td style={td}>{r.id}</td>
                  <td style={td}>{r.rfq_id}</td>
                  <td style={td}>{r.offer_id}</td>
                  <td style={td}>{r.buyer_id}</td>
                  <td style={td}>{r.seller_id}</td>
                  <td style={td}>{r.amount_pi}</td>
                  <td style={td}>{r.status}</td>
                  <td style={td}>{r.created_at}</td>
                  <td style={td}>
                    <button style={miniBtn} onClick={() => nav(`/orders/${r.id}`)}>Open</button>
                    <button style={miniBtn} onClick={() => nav(`/pi/payment/${r.id}`)}>Pay</button>
                  </td>
                </tr>
              ))}
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ padding: 12, opacity: 0.7 }}>No orders.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}

const inp = {
  flex: "1 1 320px",
  padding: 12,
  borderRadius: 12,
  background: "rgba(0,0,0,.18)",
  color: "white",
  border: "1px solid rgba(255,255,255,.12)",
};
const btn2 = {
  padding: "10px 14px",
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,.15)",
  background: "rgba(255,255,255,.06)",
  color: "white",
  cursor: "pointer",
};
const dbgBox = { margin: "12px 0", padding: 10, border: "1px dashed #555", borderRadius: 12 };
const errBox = { marginTop: 12, padding: 12, borderRadius: 12, border: "1px solid rgba(255,0,0,.25)", background: "rgba(255,0,0,.06)" };

const th = { textAlign: "left", padding: 10, fontSize: 13, borderBottom: "1px solid rgba(255,255,255,.10)", background: "rgba(255,255,255,.04)", whiteSpace: "nowrap" };
const td = { padding: 10, fontSize: 13, borderBottom: "1px solid rgba(255,255,255,.06)", whiteSpace: "nowrap", maxWidth: 260, overflow: "hidden", textOverflow: "ellipsis" };
const miniBtn = { padding: "6px 8px", borderRadius: 10, border: "1px solid rgba(255,255,255,.15)", background: "rgba(255,255,255,.06)", color: "white", cursor: "pointer", marginRight: 8 };
