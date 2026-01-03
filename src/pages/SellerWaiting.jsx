import { useState } from "react";
import { useNavigate } from "react-router-dom";
import TopBar from "../components/TopBar";
import { getMyCompany } from "../lib/session";

export default function SellerWaiting() {
  const nav = useNavigate();
  const [loading, setLoading] = useState(false);

  async function recheck() {
    setLoading(true);
    try {
      const res = await getMyCompany();
      if (res?.has_company) nav("/seller");
      else alert("Henüz şirket yetkisi yok.");
    } catch (e) {
      alert(e?.message || "Kontrol hatası");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 720, margin: "24px auto", padding: 16 }}>
      <TopBar title="Seller" />
      <h3>Şirket yetkisi bekleniyor</h3>
      <p>Admin seni bir şirkete bağlayınca Seller panel açılacak.</p>
      <button disabled={loading} onClick={recheck}>
        {loading ? "Kontrol..." : "Tekrar kontrol et"}
      </button>
    </div>
  );
}
