import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabaseClient";

function fmt(v) {
  if (v === null || v === undefined) return "";
  if (typeof v === "object") return JSON.stringify(v);
  return String(v);
}

export default function OwnerPanel() {
  const [tab, setTab] = useState("profiles"); // profiles | rfqs | offers
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [q, setQ] = useState("");

  const [counts, setCounts] = useState({ profiles: 0, rfqs: 0, offers: 0 });
  const [profiles, setProfiles] = useState([]);
  const [rfqs, setRfqs] = useState([]);
  const [offers, setOffers] = useState([]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return { profiles, rfqs, offers };

    const hit = (row) => JSON.stringify(row).toLowerCase().includes(s);

    return {
      profiles: profiles.filter(hit),
      rfqs: rfqs.filter(hit),
      offers: offers.filter(hit),
    };
  }, [q, profiles, rfqs, offers]);

  async function loadAll() {
    setLoading(true);
    setErr("");
    try {
      const { data: u } = await supabase.auth.getUser();
      if (!u?.user) throw new Error("Not authenticated");

      const [c1, c2, c3] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("rfqs").select("id", { count: "exact", head: true }),
        supabase.from("rfq_offers").select("id", { count: "exact", head: true }),
      ]);

      setCounts({
        profiles: c1.count ?? 0,
        rfqs: c2.count ?? 0,
        offers: c3.count ?? 0,
      });

      const [p, r, o] = await Promise.all([
        supabase.from("profiles").select("*").order("created_at", { ascending: false }).limit(200),
        supabase.from("rfqs").select("*").order("created_at", { ascending: false }).limit(200),
        supabase.from("rfq_offers").select("*").order("created_at", { ascending: false }).limit(200),
      ]);

      if (p.error) throw p.error;
      if (r.error) throw r.error;
      if (o.error) throw o.error;

      setProfiles(p.data || []);
      setRfqs(r.data || []);
      setOffers(o.data || []);
    } catch (e) {
      setErr(e?.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  async function updateProfile(id, patch) {
    setErr("");
    const { error } = await supabase.from("profiles").update(patch).eq("id", id);
    if (error) {
      setErr(error.message);
      return;
    }
    // local update
    setProfiles((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  }

  return (
    <div style={{ padding: 18, maxWidth: 1200, margin: "0 auto" }}>
      <h1 style={{ margin: 0 }}>Admin Dashboard</h1>
      <div style={{ opacity: 0.75, marginTop: 6 }}>
        Users / RFQs / Offers kontrol paneli (PI MODE).
      </div>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 14 }}>
        <TabButton active={tab === "profiles"} onClick={() => setTab("profiles")}>
          Users • {counts.profiles}
        </TabButton>
        <TabButton active={tab === "rfqs"} onClick={() => setTab("rfqs")}>
          RFQs • {counts.rfqs}
        </TabButton>
        <TabButton active={tab === "offers"} onClick={() => setTab("offers")}>
          Offers • {counts.offers}
        </TabButton>

        <button
          onClick={loadAll}
          style={{
            marginLeft: "auto",
            padding: "9px 12px",
            borderRadius: 10,
            border: "1px solid rgba(0,0,0,.15)",
            background: "white",
            cursor: "pointer",
          }}
        >
          Refresh
        </button>
      </div>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 12 }}>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search (id, title, company, phone...)"
          style={{
            flex: "1 1 320px",
            padding: "10px 12px",
            borderRadius: 10,
            border: "1px solid rgba(0,0,0,.15)",
          }}
        />
      </div>

      {err ? (
        <div
          style={{
            marginTop: 12,
            padding: 12,
            borderRadius: 12,
            border: "1px solid rgba(255,0,0,.25)",
            background: "rgba(255,0,0,.06)",
            whiteSpace: "pre-wrap",
          }}
        >
          <b>Hata:</b> {err}
        </div>
      ) : null}

      {loading ? <div style={{ marginTop: 14 }}>Loading...</div> : null}

      {!loading && tab === "profiles" ? (
        <div style={{ marginTop: 14 }}>
          <div style={{ opacity: 0.8, marginBottom: 8 }}>
            Role sadece <b>buyer</b> / <b>company</b>. Owner DB rolü değil (sistem owner).
          </div>

          <div style={{ overflowX: "auto", border: "1px solid rgba(0,0,0,.12)", borderRadius: 12 }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {["id", "role", "can_buy", "can_sell", "verified", "full_name", "company_name", "phone", "country", "created_at", "actions"].map(
                    (h) => (
                      <th
                        key={h}
                        style={{
                          textAlign: "left",
                          padding: 10,
                          fontSize: 13,
                          borderBottom: "1px solid rgba(0,0,0,.12)",
                          background: "rgba(0,0,0,.03)",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {(filtered.profiles || []).map((p) => (
                  <tr key={p.id}>
                    <td style={td} title={fmt(p.id)}>{fmt(p.id)}</td>

                    <td style={td}>
                      <select
                        value={p.role || "buyer"}
                        onChange={(e) => updateProfile(p.id, { role: e.target.value })}
                      >
                        <option value="buyer">buyer</option>
                        <option value="company">company</option>
                      </select>
                    </td>

                    <td style={td}>
                      <input
                        type="checkbox"
                        checked={!!p.can_buy}
                        onChange={(e) => updateProfile(p.id, { can_buy: e.target.checked })}
                      />
                    </td>

                    <td style={td}>
                      <input
                        type="checkbox"
                        checked={!!p.can_sell}
                        onChange={(e) => updateProfile(p.id, { can_sell: e.target.checked })}
                      />
                    </td>

                    <td style={td}>
                      <input
                        type="checkbox"
                        checked={!!p.is_verified_company}
                        onChange={(e) => updateProfile(p.id, { is_verified_company: e.target.checked })}
                      />
                    </td>

                    <td style={td} title={fmt(p.full_name)}>{fmt(p.full_name)}</td>
                    <td style={td} title={fmt(p.company_name)}>{fmt(p.company_name)}</td>
                    <td style={td} title={fmt(p.phone)}>{fmt(p.phone)}</td>
                    <td style={td} title={fmt(p.country)}>{fmt(p.country)}</td>
                    <td style={td} title={fmt(p.created_at)}>{fmt(p.created_at)}</td>

                    <td style={td}>
                      <button
                        onClick={() =>
                          updateProfile(p.id, {
                            can_buy: true,
                            can_sell: true,
                          })
                        }
                        style={miniBtn}
                      >
                        Buy+Sell
                      </button>
                    </td>
                  </tr>
                ))}
                {(filtered.profiles || []).length === 0 ? (
                  <tr>
                    <td style={{ padding: 12, opacity: 0.7 }} colSpan={11}>
                      No rows.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      {!loading && tab === "rfqs" ? (
        <div style={{ marginTop: 14 }}>
          <SimpleTable
            rows={filtered.rfqs}
            columns={[
              "id",
              "buyer_id",
              "owner_id",
              "title",
              "country",
              "budget_pi",
              "status",
              "created_at",
            ]}
          />
        </div>
      ) : null}

      {!loading && tab === "offers" ? (
        <div style={{ marginTop: 14 }}>
          <SimpleTable
            rows={filtered.offers}
            columns={[
              "id",
              "rfq_id",
              "owner_id",
              "price_pi",
              "status",
              "created_at",
            ]}
          />
        </div>
      ) : null}
    </div>
  );
}

function TabButton({ active, children, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "9px 12px",
        borderRadius: 10,
        border: "1px solid rgba(0,0,0,.15)",
        background: active ? "rgba(0,0,0,.08)" : "white",
        cursor: "pointer",
      }}
    >
      {children}
    </button>
  );
}

function SimpleTable({ rows, columns }) {
  return (
    <div style={{ overflowX: "auto", border: "1px solid rgba(0,0,0,.12)", borderRadius: 12 }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            {columns.map((c) => (
              <th
                key={c}
                style={{
                  textAlign: "left",
                  padding: 10,
                  fontSize: 13,
                  borderBottom: "1px solid rgba(0,0,0,.12)",
                  background: "rgba(0,0,0,.03)",
                  whiteSpace: "nowrap",
                }}
              >
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {(rows || []).map((r) => (
            <tr key={r.id}>
              {columns.map((c) => (
                <td key={c} style={td} title={fmt(r?.[c])}>
                  {fmt(r?.[c])}
                </td>
              ))}
            </tr>
          ))}
          {(rows || []).length === 0 ? (
            <tr>
              <td style={{ padding: 12, opacity: 0.7 }} colSpan={columns.length}>
                No rows.
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}

const td = {
  padding: 10,
  fontSize: 13,
  borderBottom: "1px solid rgba(0,0,0,.08)",
  verticalAlign: "top",
  whiteSpace: "nowrap",
  maxWidth: 280,
  overflow: "hidden",
  textOverflow: "ellipsis",
};

const miniBtn = {
  padding: "6px 8px",
  borderRadius: 8,
  border: "1px solid rgba(0,0,0,.15)",
  background: "white",
  cursor: "pointer",
};
