export default function ReferralBox() {
  const copy = () => {
    const link = `${window.location.origin}/?ref=USER_ID`;
    navigator.clipboard.writeText(link);
    alert("Referans linki kopyalandı 🔗");
  };

  return (
    <div style={{ marginTop: 20 }}>
      <h4>🎁 Davet Et – Credit Kazan</h4>
      <p>Her yeni kullanıcı → 20 Credit</p>
      <button onClick={copy}>Referans Linkini Kopyala</button>
    </div>
  );
}
