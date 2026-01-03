import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export default function StoreCompany() {
  const { id } = useParams(); // company_id (bigint)
  const [loading, setLoading] = useState(true);
  const [company, setCompany] = useState(null);
  const [showrooms, setShowrooms] = useState([]);
  const [products, setProducts] = useState([]);

  async function load() {
    setLoading(true);

    const cRes = await supabase
      .from("companies")
      .select("id,name,country,city,sector,status")
      .eq("id", id)
      .maybeSingle();

    if (cRes.error) alert(cRes.error.message);
    setCompany(cRes.data);

    const sRes = await supabase
      .from("showrooms")
      .select("id,title,description,created_at")
      .eq("company_id", id)
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (sRes.error) alert(sRes.error.message);
    setShowrooms(sRes.data || []);

    const pRes = await supabase
      .from("products")
      .select("id,title,description,price_text,unit,moq,showroom_id,created_at")
      .eq("company_id", id)
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (pRes.error) alert(pRes.error.message);
    setProducts(pRes.data || []);

    setLoading(false);
  }

  useEffect(() => { load(); }, [id]);

  if (loading) return <div style={{ maxWidth: 980, margin:"24px auto", padding:16 }}><p>Yükleniyor...</p></div>;

  if (!company) return <div style={{ maxWidth: 980, margin:"24px auto", padding:16 }}><p>Şirket bulunamadı.</p></div>;

  return (
    <div style={{ maxWidth: 980, margin:"24px auto", padding:16 }}>
      <div style={{ display:"flex", justifyContent:"space-between", gap:12, flexWrap:"wrap" }}>
        <div>
          <h2 style={{ margin:"0 0 6px 0" }}>{company.name}</h2>
          <div style={{ opacity:0.75 }}>
            {(company.country || "")} {(company.city || "")} • {company.sector || ""} • {company.status}
          </div>
        </div>
        <button onClick={load}>Yenile</button>
      </div>

      <div style={{ marginTop: 18 }}>
        <h3>Vitrinler</h3>
        {showrooms.length === 0 ? <p>Vitrin yok.</p> : (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(260px, 1fr))", gap:12 }}>
            {showrooms.map(s => (
              <div key={s.id} style={{ border:"1px solid #ddd", borderRadius:14, padding:12 }}>
                <b>{s.title}</b>
                <div style={{ opacity:0.75, marginTop:6 }}>{s.description || ""}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ marginTop: 18 }}>
        <h3>Ürünler</h3>
        {products.length === 0 ? <p>Ürün yok.</p> : (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(260px, 1fr))", gap:12 }}>
            {products.map(p => (
              <div key={p.id} style={{ border:"1px solid #ddd", borderRadius:14, padding:12 }}>
                <div style={{ display:"flex", justifyContent:"space-between", gap:10 }}>
                  <b>{p.title}</b>
                  <span style={{ opacity:0.7 }}>{p.price_text || "RFQ"}</span>
                </div>
                <div style={{ opacity:0.75, marginTop:6 }}>{p.description || ""}</div>
                <div style={{ opacity:0.75, marginTop:6 }}>
                  {p.unit ? `Unit: ${p.unit}` : ""} {p.moq ? ` • MOQ: ${p.moq}` : ""}
                </div>
                <button style={{ marginTop:10 }} onClick={() => alert("Buradan RFQ akışına bağlayacağız (ürüne göre).")}>
                  RFQ Gönder
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
