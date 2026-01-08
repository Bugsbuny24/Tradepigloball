import Page from "../components/Page";

export default function Home() {
  return (
    <Page
      title="TradePiGloball"
      subtitle="PI MODE • showroom + RFQ (Payments yok, escrow yok, dispute yok)"
    >
      <p>
        TradePiGloball üretici ve alıcıyı aracısız buluşturan bir B2B vitrindir.
      </p>

      <ul style={{ marginTop: 16, lineHeight: 1.8, opacity: 0.85 }}>
        <li>🔹 Ürün ekle (showroom)</li>
        <li>🔹 RFQ aç (talep topla)</li>
        <li>🔹 Teklif kabul et → Order oluşsun</li>
        <li>🔹 Pi ödeme dışarıda yapılır</li>
      </ul>
    </Page>
  );
}
