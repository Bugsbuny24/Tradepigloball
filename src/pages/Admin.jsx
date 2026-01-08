import React from "react";
import { supabase } from "../lib/supabaseClient";
import { getAuthDebug } from "../lib/debugAuth";

export default function Admin() {
  const [authDbg, setAuthDbg] = React.useState(null);
  const [isAdmin, setIsAdmin] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [err, setErr] = React.useState("");
  const [ok, setOk] = React.useState("");

  const [flags, setFlags] = React.useState([]);
  const [grantUserId, setGrantUserId] = React.useState("");
  const [grantAmount, setGrantAmount] = React.useState("10");
  const [ledger, setLedger] = React.useState([]);

  async function checkAdminAndLoad() {
    setLoading(true);
    setErr("");
    setOk("");

    try {
      const dbg = await getAuthDebug();
      setAuthDbg(dbg);

      if (!dbg?.userId) throw new Error("Not authenticated.");

      // admins tablosunda var mı?
      const a = await supabase.from("admins").select("user_id").eq("user_id", dbg.userId).maybeSingle();
      const admin = !!a.data?.user_id && !a.error;
      setIsAdmin(admin);

      // flags oku (admin olmasa da okuyabilir; update admin)
      const f = await supabase.from("feature_flags").select("*").order("key", { ascending: true });
      if (!f.error) setFlags(f.data || []);

      // ledger (admin isen bak)
      if (admin) {
        const l = await supabase.from("credit_ledger").select("*").order("created_at", { ascending: false }).limit(100);
        if (!l.error) setLedger(l.data || []);
      } else {
        setLedger([]);
      }
    } catch (e) {
      setErr(e?.message || "Admin load error");
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    checkAdminAndLoad();
    const { data: sub } = supabase.auth.onAuthStateChange(() => checkAdminAndLoad());
    return () => sub?.subscription?.unsubscribe?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function toggleFlag(key, enabled) {
    setErr("");
    setOk("");
    try {
      if (!isAdmin) throw new Error("Not admin.");

      const { error } = await supabase
        .from("feature_flags")
        .update({ enabled: !enabled, updated_at: new Date().toISOString() })
        .eq("key", key);

      if (error) throw error;

      setOk("Flag updated ✅");
      await checkAdminAndLoad();
    } catch (e) {
      setErr(e?.message || "Flag update error");
    }
  }

  async function grantCredits() {
    setErr("");
    setOk("");

    try {
      if (!isAdmin) throw new Error("Not admin.");
      if (!grantUserId) throw new Error("Target user_id required.");
      const n = Number(grantAmount);
      if (!Number.isFinite(n) || n <= 0) throw new Error("Amount must be > 0.");

      // ADMIN grant: direkt ledger’a +amount yazıyoruz
      const { error } = await supabase.from("credit_ledger").insert({
        user_id: grantUserId,
        action: "ADMIN_GRANT",
        amount: n,
        note: "admin grant",
      });

      if (error) throw error;

      setOk("Granted ✅");
      await checkAdminAndLoad();
    } catch (e) {
      setErr(e?.message || "Grant error");
    }
  }

  return (
    <div style={{ padding: 16, maxWidth: 1100, margin: "0 auto" }}>
      <h2 style={{ margin: 0 }}>Admin</h2>
      <div style={{ opacity: 0.75, marginTop: 6 }}>Feature flags + credit grant + ledger</div>

      <div style={dbgBox}>
        <b>Auth Debug</b>
        <div>userId: {authDbg?.userId ?? "-"}</div>
        <div>email: {authDbg?.email ?? "-"}</div>
        <div style={{ marginTop: 6 }}>
          <b>Admin:</b> {loading ? "..." : isAdmin ? "YES ✅" : "NO"}
        </div>
      </div>

      {err ? <div style={errBox}><b>Hata:</b> {err}</div> : null}
      {ok ? <div style={okBox}>{ok}</div> : null}
      {loading ? <div style={{ marginTop: 12, opacity: 0.8 }}>Loading…</div> : null}

      {!loading ? (
        <>
          <div style={card}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
              <h3 style={{ margin: 0 }}>Feature Flags</h3>
              <button onClick={checkAdminAndLoad} style={btn2}>Refresh</button>
            </div>

            <div style={{ marginTop: 10, overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    {["key", "enabled", "note", "updated_at", "actions"].map((h) => (
                      <th key={h} style={th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {flags.map((f) => (
                    <tr key={f.key}>
                      <td style={td}>{f.key}</td>
                      <td style={td}>{String(!!f.enabled)}</td>
                      <td style={td}>{f.note ?? ""}</td>
                      <td style={td}>{f.updated_at ?? ""}</td>
                      <td style={td}>
                        <button
                          style={miniBtn}
                          onClick={() => toggleFlag(f.key, !!f.enabled)}
                          disabled={!isAdmin}
                          title={!isAdmin ? "Not admin" : "Toggle"}
                        >
                          Toggle
                        </button>
                      </td>
                    </tr>
                  ))}
                  {flags.length === 0 ? (
                    <tr><td colSpan={5} style={{ padding: 12, opacity: 0.7 }}>No flags.</td></tr>
                  ) : null}
                </tbody>
              </table>
            </div>

            {!isAdmin ? (
              <div style={{ opacity: 0.7, marginTop: 10 }}>
                Not: Toggle için admin olman lazım. (Aşağıdaki SQL ile kendi UID’ni admins tablosuna ekle.)
              </div>
            ) : null}
          </div>

          <div style={card}>
            <h3 style={{ marginTop: 0 }}>Credit Grant (Admin)</h3>

            <div style={{ display: "grid", gap: 10, maxWidth: 520 }}>
              <input style={inp} value={grantUserId} onChange={(e) => setGrantUserId(e.target.value)} placeholder="target user_id (uuid)" />
              <input style={inp} value={grantAmount} onChange={(e) => setGrantAmount(e.target.value)} placeholder="amount (integer)" />
              <button style={btn} onClick={grantCredits} disabled={!isAdmin}>
                Grant Credits
              </button>
              <div style={{ opacity: 0.7 }}>
                Grant işlemi <b>credit_ledger</b> tablosuna +amount yazar (bakiye ledger toplamıdır).
              </div>
            </div>
          </div>

          <div style={card}>
            <h3 style={{ marginTop: 0 }}>Credit Ledger (last 100)</h3>
            {!isAdmin ? (
              <div style={{ opacity: 0.7 }}>Not admin → ledger gösterilmez.</div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      {["created_at", "user_id", "action", "amount", "note"].map((h) => (
                        <th key={h} style={th}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {ledger.map((r) => (
                      <tr key={r.id}>
                        <td style={td}>{r.created_at}</td>
                        <td style={td}>{r.user_id}</td>
                        <td style={td}>{r.action}</td>
                        <td style={td}>{r.amount}</td>
                        <td style={td}>{r.note ?? ""}</td>
                      </tr>
                    ))}
                    {ledger.length === 0 ? (
                      <tr><td colSpan={5} style={{ padding: 12, opacity: 0.7 }}>No rows.</td></tr>
                    ) : null}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      ) : null}
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

const btn = { padding: 12, borderRadius: 14, background: "#6d5cff", color: "white", border: "none", fontWeight: 800 };
const btn2 = {
  padding: "10px 14px",
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,.15)",
  background: "rgba(255,255,255,.06)",
  color: "white",
  cursor: "pointer",
};

const dbgBox = { margin: "12px 0", padding: 10, border: "1px dashed #555", borderRadius: 12 };
const card = { marginTop: 12, padding: 12, borderRadius: 12, background: "rgba(0,0,0,.18)" };

const errBox = { marginTop: 12, padding: 12, borderRadius: 12, border: "1px solid rgba(255,0,0,.25)", background: "rgba(255,0,0,.06)" };
const okBox = { marginTop: 12, padding: 12, borderRadius: 12, border: "1px solid rgba(0,255,0,.18)", background: "rgba(0,255,0,.06)" };

const th = { textAlign: "left", padding: 10, fontSize: 13, borderBottom: "1px solid rgba(255,255,255,.10)", background: "rgba(255,255,255,.04)", whiteSpace: "nowrap" };
const td = { padding: 10, fontSize: 13, borderBottom: "1px solid rgba(255,255,255,.06)", whiteSpace: "nowrap", maxWidth: 340, overflow: "hidden", textOverflow: "ellipsis" };
const miniBtn = { padding: "6px 8px", borderRadius: 10, border: "1px solid rgba(255,255,255,.15)", background: "rgba(255,255,255,.06)", color: "white", cursor: "pointer" };
