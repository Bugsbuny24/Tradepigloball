import { useEffect, useMemo, useState } from "react";
import supabase from "../lib/supabaseClient";

export default function OwnerPanel() {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [active, setActive] = useState("profiles"); // profiles | rfqs | offers

  const [counts, setCounts] = useState({ profiles: 0, rfqs: 0, offers: 0 });
  const [profiles, setProfiles] = useState([]);
  const [rfqs, setRfqs] = useState([]);
  const [offers, setOffers] = useState([]);

  const tabs = useMemo(
    () => [
      { key: "profiles", label: `Users (profiles) • ${counts.profiles}` },
      { key: "rfqs", label: `RFQs • ${counts.rfqs}` },
      { key: "offers", label: `Offers • ${counts.offers}` },
    ],
    [counts]
  );

  async function loadAll() {
    setLoading(true);
    setErr("");
    try {
      const {
        data: { user },
        error: userErr,
      } = await supabase.auth.getUser();
      if (userErr) throw userErr;
      if (!user) throw new Error("Not authenticated");

      // counts (fast)
      const [c1, c2, c3] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("rfqs").select("id", { count: "exact", head: true }),
        supabase
          .from("rfq_offers")
          .select("id", { count: "exact", head: true }),
      ]);

      setCounts({
        profiles: c1.count ?? 0,
        rfqs: c2.count ?? 0,
        offers: c3.count ?? 0,
      });

      // latest rows
      const [p, r, o] = await Promise.all([
        supabase
          .from("profiles")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(25),
        supabase
          .from("rfqs")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(25),
        supabase
          .from("rfq_offers")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(25),
      ]);

      if (p.error) throw p.error;
      if (r.error) throw r.error;
      if (o.error) throw o.error;

      setProfiles(p.data ?? []);
      setRfqs(r.data ?? []);
      setOffers(o.data ?? []);
    } catch (e) {
      setErr(e?.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  return (
    <div style={{ padding: 18, maxWidth: 1100, margin: "0 auto" }}>
      <h1 style={{ marginBottom: 6 }}>Owner Panel</h1>
      <div style={{ opacity: 0.8, marginBottom: 14 }}>
        Kayıtlar / RFQ / Offer düşüyor mu? Buradan canlı görürsün.
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setActive(t.key)}
            style={{
              padding: "8px 10px",
              borderRadius: 10,
              border: "1px solid rgba(0,0,0,.15)",
              background: active === t.key ? "rgba(0,0,0,.08)" : "white",
              cursor: "pointer",
            }}
          >
            {t.label}
          </button>
        ))}

        <button
          onClick={loadAll}
          style={{
            marginLeft: "auto",
            padding: "8px 10px",
            borderRadius: 10,
            border: "1px solid rgba(0,0,0,.15)",
            background: "white",
            cursor: "pointer",
          }}
        >
          Refresh
        </button>
      </div>

      {err ? (
        <div
          style={{
            padding: 12,
            borderRadius: 12,
            border: "1px solid rgba(255,0,0,.25)",
            background: "rgba(255,0,0,.06)",
            marginBottom: 12,
            whiteSpace: "pre-wrap",
          }}
        >
          <b>Hata:</b> {err}
          <div style={{ marginTop: 8, opacity: 0.85 }}>
            Not: Eğer burada “permission denied / RLS” görürsen, altta verdiğim RLS SELECT policy’leri eksik demek.
          </div>
        </div>
      ) : null}

      {loading ? <div>Loading...</div> : null}

      {!loading && active === "profiles" ? (
        <Table
          columns={[
            ["id", "id"],
            ["role", "role"],
            ["full_name", "full_name"],
            ["company_name", "company_name"],
            ["phone", "phone"],
            ["country", "country"],
            ["created_at", "created_at"],
          ]}
          rows={profiles}
        />
      ) : null}

      {!loading && active === "rfqs" ? (
        <Table
          columns={[
            ["id", "id"],
            ["buyer_id", "buyer_id"],
            ["owner_id", "owner_id"],
            ["title", "title"],
            ["country", "country"],
            ["budget_pi", "budget_pi"],
            ["status", "status"],
            ["created_at", "created_at"],
          ]}
          rows={rfqs}
        />
      ) : null}

      {!loading && active === "offers" ? (
        <Table
          columns={[
            ["id", "id"],
            ["rfq_id", "rfq_id"],
            ["owner_id", "owner_id"],
            ["price_pi", "price_pi"],
            ["status", "status"],
            ["created_at", "created_at"],
          ]}
          rows={offers}
        />
      ) : null}
    </div>
  );
}

function Table({ columns, rows }) {
  return (
    <div style={{ overflowX: "auto", border: "1px solid rgba(0,0,0,.12)", borderRadius: 12 }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            {columns.map(([key, label]) => (
              <th
                key={key}
                style={{
                  textAlign: "left",
                  padding: 10,
                  fontSize: 13,
                  borderBottom: "1px solid rgba(0,0,0,.12)",
                  background: "rgba(0,0,0,.03)",
                }}
              >
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {(rows ?? []).map((r) => (
            <tr key={r.id}>
              {columns.map(([key]) => (
                <td
                  key={key}
                  style={{
                    padding: 10,
                    fontSize: 13,
                    borderBottom: "1px solid rgba(0,0,0,.08)",
                    verticalAlign: "top",
                    whiteSpace: "nowrap",
                    maxWidth: 280,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                  title={String(r?.[key] ?? "")}
                >
                  {String(r?.[key] ?? "")}
                </td>
              ))}
            </tr>
          ))}
          {(rows ?? []).length === 0 ? (
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
