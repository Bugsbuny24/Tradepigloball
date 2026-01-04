import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function OwnerPanel() {
  const [userId, setUserId] = useState(null);
  const [active, setActive] = useState("overview");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [counts, setCounts] = useState({
    buyers: null,
    companies: null,
    company_users: null,
    products: null,
    showrooms: null,
    rfqs: null,
  });

  const [rows, setRows] = useState([]);
  const [limit, setLimit] = useState(50);

  const tabs = useMemo(
    () => [
      { key: "overview", label: "Overview" },
      { key: "companies", label: "Companies" },
      { key: "company_users", label: "Company Users" },
      { key: "products", label: "Products" },
      { key: "showrooms", label: "Showrooms" },
      { key: "rfqs", label: "RFQs" },
      { key: "buyers", label: "Buyers" },
    ],
    []
  );

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      setUserId(data?.user?.id ?? null);
    })();
  }, []);

  const refreshCounts = async () => {
    setError("");
    setLoading(true);
    try {
      const tables = ["buyers", "companies", "company_users", "products", "showrooms", "rfqs"];
      const next = { ...counts };

      for (const t of tables) {
        const { count, error: e } = await supabase
          .from(t)
          .select("*", { count: "exact", head: true });

        next[t] = e ? "ERR" : count ?? 0;
      }

      setCounts(next);
    } catch (e) {
      setError(String(e?.message || e));
    } finally {
      setLoading(false);
    }
  };

  const loadTable = async (table) => {
    setError("");
    setLoading(true);
    try {
      const { data, error: e } = await supabase
        .from(table)
        .select("*")
        .order("created_at", { ascending: false })
        .limit(Number(limit) || 50);

      if (e) throw e;
      setRows(data || []);
    } catch (e) {
      setRows([]);
      setError(String(e?.message || e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // overview açılınca sayıları çek
    if (active === "overview") refreshCounts();
    else loadTable(active);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, limit]);

  const cardStyle = {
    background: "rgba(0,0,0,0.35)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 16,
    padding: 16,
    boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
    backdropFilter: "blur(10px)",
  };

  const btn = (on, key) => ({
    padding: "10px 12px",
    borderRadius: 12,
    border: on ? "1px solid rgba(255,255,255,0.35)" : "1px solid rgba(255,255,255,0.15)",
    background: on ? "rgba(120,70,255,0.35)" : "rgba(255,255,255,0.06)",
    color: "#fff",
    cursor: "pointer",
    fontWeight: 700,
    fontSize: 13,
  });

  const topWrap = {
    minHeight: "100vh",
    padding: 18,
    color: "#fff",
    fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial",
    background:
      "radial-gradient(1200px 700px at 10% 10%, rgba(0,180,255,0.18), transparent 55%)," +
      "radial-gradient(900px 500px at 90% 20%, rgba(160,80,255,0.20), transparent 50%)," +
      "linear-gradient(180deg, #0b1230, #070a18 60%, #060713)",
  };

  return (
    <div style={topWrap}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 900, letterSpacing: 0.2 }}>
            Platform Owner Panel
          </div>
          <div style={{ opacity: 0.8, marginTop: 4, fontSize: 13 }}>
            Gizli panel — sadece platform owner erişir.
          </div>
          <div style={{ opacity: 0.75, marginTop: 6, fontSize: 12 }}>
            UID: <span style={{ fontFamily: "monospace" }}>{userId || "?"}</span>
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button
            onClick={() => window.location.href = "/"}
            style={{
              padding: "10px 12px",
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.15)",
              background: "rgba(255,255,255,0.06)",
              color: "#fff",
              cursor: "pointer",
              fontWeight: 800,
            }}
          >
            Home
          </button>

          <button
            onClick={async () => {
              await supabase.auth.signOut();
              window.location.href = "/login";
            }}
            style={{
              padding: "10px 12px",
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.15)",
              background: "rgba(255,80,80,0.20)",
              color: "#fff",
              cursor: "pointer",
              fontWeight: 900,
            }}
          >
            Logout
          </button>
        </div>
      </div>

      <div style={{ marginTop: 14, display: "flex", flexWrap: "wrap", gap: 8 }}>
        {tabs.map((t) => (
          <button
            key={t.key}
            style={btn(active === t.key, t.key)}
            onClick={() => setActive(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ ...cardStyle, display: "flex", gap: 10, alignItems: "center" }}>
          <div style={{ fontWeight: 800, opacity: 0.85 }}>Row limit</div>
          <input
            value={limit}
            onChange={(e) => setLimit(e.target.value)}
            type="number"
            min={1}
            max={500}
            style={{
              width: 90,
              padding: "8px 10px",
              borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.18)",
              background: "rgba(0,0,0,0.25)",
              color: "#fff",
              outline: "none",
              fontWeight: 700,
            }}
          />
          <button
            onClick={() => (active === "overview" ? refreshCounts() : loadTable(active))}
            style={{
              padding: "9px 12px",
              borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.16)",
              background: "rgba(0,200,255,0.18)",
              color: "#fff",
              cursor: "pointer",
              fontWeight: 900,
            }}
          >
            Refresh
          </button>
        </div>

        {error ? (
          <div style={{ ...cardStyle, borderColor: "rgba(255,80,80,0.35)", color: "#ffd6d6" }}>
            <div style={{ fontWeight: 900 }}>Error</div>
            <div style={{ marginTop: 6, fontFamily: "monospace", fontSize: 12, whiteSpace: "pre-wrap" }}>
              {error}
            </div>
          </div>
        ) : null}

        {loading ? (
          <div style={{ ...cardStyle, opacity: 0.9 }}>Loading...</div>
        ) : null}
      </div>

      <div style={{ marginTop: 14 }}>
        {active === "overview" ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
            {Object.entries(counts).map(([k, v]) => (
              <div key={k} style={cardStyle}>
                <div style={{ fontWeight: 900, fontSize: 14, opacity: 0.9 }}>{k}</div>
                <div style={{ fontWeight: 1000, fontSize: 28, marginTop: 6 }}>
                  {v === null ? "…" : String(v)}
                </div>
                <div style={{ opacity: 0.75, fontSize: 12, marginTop: 6 }}>
                  Head-count ile (RLS izin veriyorsa).
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={cardStyle}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 1000, textTransform: "uppercase", letterSpacing: 0.6 }}>
                  {active}
                </div>
                <div style={{ opacity: 0.78, fontSize: 12, marginTop: 4 }}>
                  Son {Number(limit) || 50} kayıt (created_at desc).
                </div>
              </div>

              <div style={{ opacity: 0.8, fontSize: 12 }}>
                Rows: <b>{rows?.length || 0}</b>
              </div>
            </div>

            <div style={{ marginTop: 12 }}>
              {rows?.length ? (
                <div
                  style={{
                    overflowX: "auto",
                    borderRadius: 12,
                    border: "1px solid rgba(255,255,255,0.10)",
                  }}
                >
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                    <thead>
                      <tr style={{ background: "rgba(255,255,255,0.06)" }}>
                        {Object.keys(rows[0]).slice(0, 8).map((h) => (
                          <th
                            key={h}
                            style={{
                              textAlign: "left",
                              padding: "10px 10px",
                              borderBottom: "1px solid rgba(255,255,255,0.10)",
                              whiteSpace: "nowrap",
                              fontWeight: 900,
                            }}
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((r, idx) => (
                        <tr key={idx} style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                          {Object.keys(rows[0]).slice(0, 8).map((h) => (
                            <td key={h} style={{ padding: "10px 10px", verticalAlign: "top" }}>
                              <span style={{ fontFamily: "monospace", whiteSpace: "nowrap" }}>
                                {typeof r[h] === "object" ? JSON.stringify(r[h]) : String(r[h])}
                              </span>
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div style={{ opacity: 0.75, padding: 10 }}>
                  Kayıt yok (ya da RLS izin vermiyor).
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div style={{ marginTop: 18, opacity: 0.7, fontSize: 12 }}>
        Not: Bu panel minimal “test paneli”. İstersen sonraki adımda:
        <b> owner</b> için “Company yönet / RFQ yönet / ürün-showroom moderasyon” butonlarını ekleriz.
      </div>
    </div>
  );
              }
