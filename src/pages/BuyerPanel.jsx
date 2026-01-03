import { useEffect, useState } from "react";
import TopBar from "../components/TopBar";
import { supabase } from "../lib/supabaseClient";

export default function BuyerPanel() {
  const [loading, setLoading] = useState(true);
  const [rfqs, setRfqs] = useState([]);
  const [creating, setCreating] = useState(false);

  const remaining = Math.max(0, 5 - rfqs.length);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from("rfqs")
      .select("id,title,status,created_at")
      .order("created_at", { ascending: false });

    if (error) alert(error.message);
    setRfqs(data || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function createRFQ(e) {
    e.preventDefault();
    if (remaining <= 0) {
      alert("RFQ hakkın bitti (5). Ücretli pakete geçilecek.");
      return;
    }

    setCreating(true);
    const title = e.target.title.value.trim();
    const details = e.target.details.value.trim() || null;
    const target_country = e.target.target_country.value.trim() || null;
    const quantity = e.target.quantity.value.trim() || null;

    const { error } = await supabase.from("rfqs").insert({
      buyer_id: (await supabase.auth.getUser()).data.user.id,
      title,
      details,
      target_country,
      quantity,
    });

    setCreating(false);

    if (error) {
      // DB trigger burada patlatır: RFQ limit reached (5)...
      alert(error.message);
      return;
    }

    e.target.reset();
    await load();
  }

  return (
    <div style={{ maxWidth: 900, margin: "24px auto", padding: 16 }}>
      <TopBar title="Buyer Panel" />

      <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
        <div>
          <h3 style={{ margin: "10px 0" }}>RFQ</h3>
          <p style={{ margin: 0, opacity: 0.8 }}>
            Kalan RFQ hakkı: <b>{remaining}</b> / 5
          </p>
        </div>

        <div style={{ alignSelf: "center" }}>
          {remaining <= 0 && (
            <button onClick={() => alert("Buraya pricing/upgrade akışı bağlanacak.")}>
              RFQ Paketi Satın Al
            </button>
          )}
        </div>
      </div>

      <div style={{ marginTop: 16, padding: 12, border: "1px solid #ddd", borderRadius: 12 }}>
        <h4 style={{ marginTop: 0 }}>Yeni RFQ</h4>
        <form onSubmit={createRFQ} style={{ display: "grid", gap: 10 }}>
          <input name="title" placeholder="Başlık (örn: 1000 adet X ürün)" required />
          <textarea name="details" placeholder="Detaylar" rows={4} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <input name="target_country" placeholder="Hedef ülke (opsiyonel)" />
            <input name="quantity" placeholder="Miktar (opsiyonel)" />
          </div>
          <button disabled={creating || remaining <= 0} type="submit">
            {creating ? "Oluşturuluyor..." : "RFQ Oluştur"}
          </button>
        </form>
      </div>

      <div style={{ marginTop: 18 }}>
        <h4>RFQ Listem</h4>
        {loading ? (
          <p>Yükleniyor...</p>
        ) : rfqs.length === 0 ? (
          <p>Henüz RFQ yok.</p>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            {rfqs.map((r) => (
              <div key={r.id} style={{ border: "1px solid #ddd", borderRadius: 12, padding: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                  <b>{r.title}</b>
                  <span style={{ opacity: 0.7 }}>{r.status}</span>
                </div>
                <div style={{ opacity: 0.7, marginTop: 6 }}>{new Date(r.created_at).toLocaleString()}</div>
              </div>
            ))}
          </div>
        )}
        <button style={{ marginTop: 12 }} onClick={load}>Yenile</button>
      </div>
    </div>
  );
}
