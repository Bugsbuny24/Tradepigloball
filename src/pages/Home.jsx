export default function Home() {
  const page = {
    minHeight: "calc(100vh - 64px)",
    padding: "28px 16px",
    background:
      "radial-gradient(900px 500px at 20% 0%, rgba(99,102,241,.22), transparent 60%), radial-gradient(900px 500px at 80% 10%, rgba(34,197,94,.16), transparent 55%), linear-gradient(180deg, rgba(15,23,42,1), rgba(2,6,23,1))",
    color: "#e5e7eb",
  };

  const wrap = { maxWidth: 980, margin: "0 auto" };

  const card = {
    border: "1px solid rgba(255,255,255,.10)",
    background:
      "linear-gradient(180deg, rgba(255,255,255,.06), rgba(255,255,255,.03))",
    borderRadius: 18,
    padding: 22,
    boxShadow: "0 14px 40px rgba(0,0,0,.35)",
    backdropFilter: "blur(10px)",
  };

  const title = { margin: 0, fontSize: 34, letterSpacing: 0.2 };
  const subtitle = { marginTop: 10, opacity: 0.9, lineHeight: 1.6 };

  const pills = {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
    marginTop: 16,
  };

  const pill = {
    fontSize: 12,
    padding: "7px 10px",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,.14)",
    background: "rgba(255,255,255,.06)",
    opacity: 0.95,
  };

  return (
    <div style={page}>
      <div style={wrap}>
        <div style={card}>
          <h2 style={title}>TradePiGloball</h2>
          <div style={subtitle}>
            <b>PI MODE</b> • showroom + RFQ • (Payments yok, escrow yok, dispute
            yok)
            <br />
            Bu build “test / demo” mantığında: gerçek ödeme yok, sadece akış
            simülasyonu.
          </div>

          <div style={pills}>
            <div style={pill}>🔒 Auth + Supabase</div>
            <div style={pill}>📩 RFQ + Offer</div>
            <div style={pill}>🧾 Order + Payment ekranı</div>
            <div style={pill}>🪙 Credits</div>
          </div>
        </div>

        <div
          style={{
            marginTop: 14,
            opacity: 0.85,
            fontSize: 13,
            lineHeight: 1.6,
          }}
        >
          İpucu: Üst menüden <b>RFQs</b> → teklif akışını dene, <b>Orders</b> →
          order listesini gör, <b>Credits</b> → bakiyeyi test et.
        </div>
      </div>
    </div>
  );
}
