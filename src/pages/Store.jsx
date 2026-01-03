import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export default function Store() {
  const nav = useNavigate();
  const [loading, setLoading] = useState(true);
  const [companies, setCompanies] = useState([]);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from("companies")
      .select("id,name,country,city,sector,status,created_at")
      .eq("status", "approved")
      .order("created_at", { ascending: false });

    if (error) alert(error.message);
    setCompanies(data || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  return (
    <div style={{ maxWidth: 980, margin: "24px auto", padding: 16 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", gap:12, flexWrap:"wrap" }}>
        <h2 style={{ margin: 0 }}>Store (Approved)</h2>
        <button onClick={load}>Yenile</button>
      </div>

      {loading ? (
        <p>Yükleniyor...</p>
      ) : companies.length === 0 ? (
        <p>Henüz onaylı şirket yok.</p>
      ) : (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(240px, 1fr))", gap:12, marginTop:12 }}>
          {companies.map((c) => (
            <div key={c.id} style={{ border:"1px solid #ddd", borderRadius:14, padding:12 }}>
              <b>{c.name}</b>
              <div style={{ opacity:0.75, marginTop:6 }}>
                {(c.country || "")} {(c.city || "")}
              </div>
              <div style={{ opacity:0.75 }}>{c.sector || ""}</div>
              <button style={{ marginTop:10 }} onClick={() => nav(`/store/company/${c.id}`)}>
                Vitrine gir
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
