import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function OwnerPanel() {
  const [tab, setTab] = useState("companies");
  const [loading, setLoading] = useState(true);

  const [companies, setCompanies] = useState([]);
  const [rfqs, setRfqs] = useState([]);

  async function loadCompanies() {
    setLoading(true);
    const { data, error } = await supabase
      .from("companies")
      .select("id,name,country,city,sector,status,created_by,created_at")
      .order("created_at", { ascending: false });

    if (error) alert(error.message);
    setCompanies(data || []);
    setLoading(false);
  }

  async function loadRfqs() {
    setLoading(true);
    const { data, error } = await supabase
      .from("rfqs")
      .select("id,title,status,buyer_id,company_id,created_at")
      .order("created_at", { ascending: false });

    if (error) alert(error.message);
    setRfqs(data || []);
    setLoading(false);
  }

  useEffect(() => {
    if (tab === "companies") loadCompanies();
    if (tab === "rfqs") loadRfqs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  async function setCompanyStatus(companyId, status) {
    const { error } = await supabase
      .from("companies")
      .update({ status })
      .eq("id", companyId);

    if (error) return alert(error.message);
    loadCompanies();
  }

  async function setRfqStatus(rfqId, status) {
    const { error } = await supabase
      .from("rfqs")
      .update({ status })
      .eq("id", rfqId);

    if (error) return alert(error.message);
    loadRfqs();
  }

  return (
    <div style={{ maxWidth: 1100, margin: "24px auto", padding: 16, color: "#fff" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <h1 style={{ margin: 0 }}>Owner Panel</h1>
        <button
          onClick={async () => {
            await supabase.auth.signOut();
            location.href = "/";
          }}
        >
          Logout
        </button>
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        <button onClick={() => setTab("companies")} style={{ opacity: tab === "companies" ? 1 : 0.7 }}>
          Companies
        </button>
        <button onClick={() => setTab("rfqs")} style={{ opacity: tab === "rfqs" ? 1 : 0.7 }}>
          RFQs
        </button>
      </div>

      <div style={{ marginTop: 16 }}>
        {loading ? (
          <p>Loading...</p>
        ) : tab === "companies" ? (
          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 10 }}>
            {companies.map((c) => (
              <div key={c.id} style={{ border: "1px solid #2a2f45", borderRadius: 14, padding: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                  <div>
                    <b style={{ fontSize: 18 }}>{c.name}</b>
                    <div style={{ opacity: 0.75, marginTop: 4 }}>
                      #{c.id} • {c.country || ""} {c.city || ""} • {c.sector || ""} • created_by: {c.created_by}
                    </div>
                    <div style={{ marginTop: 6 }}>
                      Status: <b>{c.status || "null"}</b>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <button onClick={() => setCompanyStatus(c.id, "approved")}>Approve</button>
                    <button onClick={() => setCompanyStatus(c.id, "pending")}>Pending</button>
                    <button onClick={() => setCompanyStatus(c.id, "rejected")}>Reject</button>
                  </div>
                </div>
              </div>
            ))}
            {companies.length === 0 && <p>Company yok.</p>}
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 10 }}>
            {rfqs.map((r) => (
              <div key={r.id} style={{ border: "1px solid #2a2f45", borderRadius: 14, padding: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                  <div>
                    <b style={{ fontSize: 18 }}>{r.title || `RFQ #${r.id}`}</b>
                    <div style={{ opacity: 0.75, marginTop: 4 }}>
                      buyer: {r.buyer_id} • company: {r.company_id} • {new Date(r.created_at).toLocaleString()}
                    </div>
                    <div style={{ marginTop: 6 }}>
                      Status: <b>{r.status || "null"}</b>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <button onClick={() => setRfqStatus(r.id, "open")}>Open</button>
                    <button onClick={() => setRfqStatus(r.id, "closed")}>Close</button>
                    <button onClick={() => setRfqStatus(r.id, "rejected")}>Reject</button>
                  </div>
                </div>
              </div>
            ))}
            {rfqs.length === 0 && <p>RFQ yok.</p>}
          </div>
        )}
      </div>
    </div>
  );
                                 }
