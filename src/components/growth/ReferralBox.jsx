export default function ReferralBox() {
  const link = `${window.location.origin}?ref=USER_ID`;

  return (
    <div>
      <button onClick={() => {
        navigator.clipboard.writeText(link);
        alert("Referral link kopyalandı 🔗");
      }}>
        🎁 Davet Et (20 Credit)
      </button>
    </div>
  );
}
