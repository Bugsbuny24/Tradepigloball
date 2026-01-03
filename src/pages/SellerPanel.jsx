import { useEffect, useState } from "react";
import TopBar from "../components/TopBar";
import Tabs from "../components/Tabs";
import { supabase } from "../lib/supabaseClient";

export default function SellerPanel() {
  const [tab, setTab] = useState("Company");
  const [ctx, setCtx] = useState({ loading: true, company: null, membership: null });
  const [showrooms, setShowrooms] = useState([]);
  const [products, setProducts] = useState([]);

  async function loadContext() {
    setCtx((s) => ({ ...s, loading: true }));
    const { data, error } = await supabase.functions.invoke("get-my-company");
    if (error) {
      alert(error.message);
      setCtx({ loading: false, company: null, membership: null });
      return;
    }
    setCtx({ loading: false, company: data.company, membership: data.membership });
  }

  async function loadShowrooms(companyId) {
    const { data, error } = await supabase
      .from("showrooms")
      .select("id,title,description,is_active,created_at")
      .eq("company_id", companyId)
      .order("created_at", { ascending: false });
    if (error) alert(error.message);
    setShowrooms(data || []);
  }

  async function loadProducts(companyId) {
    const { data, error } = await supabase
      .from("products")
      .select("id,title,description,price_text,unit,moq,is_active,showroom_id,created_at")
      .eq("company_id", companyId)
      .order("created_at", { ascending: false });
    if (error) alert(error.message);
    setProducts(data || []);
  }

  useEffect(() => {
    (async () => {
      await loadContext();
    })();
  }, []);

  useEffect(() => {
    if (!ctx.company?.id) return;
    loadShowrooms(ctx.company.id);
    loadProducts(ctx.company.id);
  }, [ctx.company?.id]);

  if (ctx.loading) {
    return (
      <div style={{ maxWidth: 900, margin: "24px auto", padding: 16 }}>
        <TopBar title="Seller Panel" />
        <p>Yükleniyor...</p>
      </div>
    );
  }

  const companyId = ctx.company?.id;

  return (
    <div style={{ maxWidth: 1000, margin: "24px auto", padding: 16 }}>
      <TopBar title="Seller Panel" />

      <div style={{ border: "1px solid #ddd", borderRadius: 14, padding: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
          <div>
            <b>{ctx.company?.name || "Company"}</b>
            <div style={{ opacity: 0.75, marginTop: 4 }}>
              Status: <b>{ctx.company?.status}</b> • Role: <b>{ctx.membership?.role}</b>
            </div>
          </div>
          <button onClick={loadContext}>Refresh</button>
        </div>
      </div>

      <Tabs
        tabs={["Company", "Badge", "Showrooms", "Products"]}
        active={tab}
        onChange={setTab}
      />

      {tab === "Company" && (
        <CompanyInfo company={ctx.company} />
      )}

      {tab === "Badge" && (
        <CompanyBadge company={ctx.company} />
      )}

      {tab === "Showrooms" && (
        <ShowroomsTab
          companyId={companyId}
          showrooms={showrooms}
          reload={() => loadShowrooms(companyId)}
        />
      )}

      {tab === "Products" && (
        <ProductsTab
          companyId={companyId}
          showrooms={showrooms}
          products={products}
          reload={() => loadProducts(companyId)}
        />
      )}
    </div>
  );
}

function CompanyInfo({ company }) {
  return (
    <div style={{ marginTop: 10, padding: 12, border: "1px solid #ddd", borderRadius: 14 }}>
      <h3 style={{ marginTop: 0 }}>Şirket Bilgisi</h3>
      <div style={{ display: "grid", gap: 6 }}>
        <div><b>Name:</b> {company?.name}</div>
        <div><b>Country:</b> {company?.country || "-"}</div>
        <div><b>City:</b> {company?.city || "-"}</div>
        <div><b>Sector:</b> {company?.sector || "-"}</div>
        <div><b>Status:</b> {company?.status}</div>
      </div>
      <p style={{ opacity: 0.7, marginTop: 10 }}>
        (Şirket güncelleme yetkisi sadece owner/admin. Bu ekran şimdilik görüntü.)
      </p>
    </div>
  );
}

function CompanyBadge({ company }) {
  // Basit rozet paneli (UI)
  return (
    <div style={{ marginTop: 10, padding: 12, border: "1px solid #ddd", borderRadius: 14 }}>
      <h3 style={{ marginTop: 0 }}>Şirket Rozeti</h3>
      <div style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 10,
        padding: 12,
        border: "1px dashed #aaa",
        borderRadius: 16
      }}>
        <div style={{ width: 46, height: 46, borderRadius: 12, border: "1px solid #ccc", display:"grid", placeItems:"center" }}>
          🏷️
        </div>
        <div>
          <div style={{ fontWeight: 700 }}>{company?.name}</div>
          <div style={{ opacity: 0.7, fontSize: 13 }}>{company?.country || ""} {company?.city || ""}</div>
          <div style={{ opacity: 0.7, fontSize: 13 }}>Status: {company?.status}</div>
        </div>
      </div>
      <p style={{ opacity: 0.7, marginTop: 10 }}>
        (Rozet tasarımını sonra image/asset ile güzelleştiririz.)
      </p>
    </div>
  );
}

function ShowroomsTab({ companyId, showrooms, reload }) {
  const [saving, setSaving] = useState(false);

  async function createShowroom(e) {
    e.preventDefault();
    setSaving(true);

    const title = e.target.title.value.trim();
    const description = e.target.description.value.trim() || null;

    const { error } = await supabase.from("showrooms").insert({
      company_id: companyId,
      title,
      description,
    });

    setSaving(false);
    if (error) return alert(error.message);

    e.target.reset();
    reload();
  }

  return (
    <div style={{ marginTop: 10 }}>
      <div style={{ padding: 12, border: "1px solid #ddd", borderRadius: 14 }}>
        <h3 style={{ marginTop: 0 }}>Vitrin Oluştur</h3>
        <form onSubmit={createShowroom} style={{ display: "grid", gap: 10 }}>
          <input name="title" placeholder="Vitrin adı" required />
          <textarea name="description" placeholder="Açıklama" rows={3} />
          <button disabled={saving} type="submit">{saving ? "Kaydediliyor..." : "Vitrin Ekle"}</button>
        </form>
      </div>

      <div style={{ marginTop: 14 }}>
        <h3>Vitrinler</h3>
        {showrooms.length === 0 ? (
          <p>Henüz vitrin yok.</p>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            {showrooms.map((s) => (
              <div key={s.id} style={{ border: "1px solid #ddd", borderRadius: 14, padding: 12 }}>
                <b>{s.title}</b>
                <div style={{ opacity: 0.7, marginTop: 6 }}>{s.description || ""}</div>
              </div>
            ))}
          </div>
        )}
        <button style={{ marginTop: 10 }} onClick={reload}>Yenile</button>
      </div>
    </div>
  );
}

function ProductsTab({ companyId, showrooms, products, reload }) {
  const [saving, setSaving] = useState(false);

  async function createProduct(e) {
    e.preventDefault();
    setSaving(true);

    const title = e.target.title.value.trim();
    const description = e.target.description.value.trim() || null;
    const price_text = e.target.price_text.value.trim() || null;
    const unit = e.target.unit.value.trim() || null;
    const moq = e.target.moq.value.trim() || null;
    const showroom_id = e.target.showroom_id.value || null;

    const { error } = await supabase.from("products").insert({
      company_id: companyId,
      showroom_id,
      title,
      description,
      price_text,
      unit,
      moq,
    });

    setSaving(false);
    if (error) return alert(error.message);

    e.target.reset();
    reload();
  }

  return (
    <div style={{ marginTop: 10 }}>
      <div style={{ padding: 12, border: "1px solid #ddd", borderRadius: 14 }}>
        <h3 style={{ marginTop: 0 }}>Ürün Ekle</h3>
        <form onSubmit={createProduct} style={{ display: "grid", gap: 10 }}>
          <input name="title" placeholder="Ürün adı" required />
          <textarea name="description" placeholder="Açıklama" rows={3} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <input name="price_text" placeholder="Fiyat (örn: RFQ / Pi / negotiable)" />
            <input name="unit" placeholder="Birim (pcs/kg/ton)" />
          </div>
          <input name="moq" placeholder="MOQ (opsiyonel)" />
          <select name="showroom_id" defaultValue="">
            <option value="">Vitrin seç (opsiyonel)</option>
            {showrooms.map((s) => (
              <option key={s.id} value={s.id}>{s.title}</option>
            ))}
          </select>
          <button disabled={saving} type="submit">{saving ? "Kaydediliyor..." : "Ürün Ekle"}</button>
        </form>
      </div>

      <div style={{ marginTop: 14 }}>
        <h3>Ürünler</h3>
        {products.length === 0 ? (
          <p>Henüz ürün yok.</p>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            {products.map((p) => (
              <div key={p.id} style={{ border: "1px solid #ddd", borderRadius: 14, padding: 12 }}>
                <div style={{ display:"flex", justifyContent:"space-between", gap:10 }}>
                  <b>{p.title}</b>
                  <span style={{ opacity: 0.7 }}>{p.is_active ? "active" : "inactive"}</span>
                </div>
                <div style={{ opacity: 0.75, marginTop: 6 }}>{p.description || ""}</div>
                <div style={{ opacity: 0.75, marginTop: 6 }}>
                  {p.price_text ? `Price: ${p.price_text}` : ""} {p.unit ? ` • Unit: ${p.unit}` : ""} {p.moq ? ` • MOQ: ${p.moq}` : ""}
                </div>
              </div>
            ))}
          </div>
        )}
        <button style={{ marginTop: 10 }} onClick={reload}>Yenile</button>
      </div>
    </div>
  );
           }
