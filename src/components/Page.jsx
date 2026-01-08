export default function Page({ title, subtitle, children }) {
  return (
    <div
      style={{
        minHeight: "calc(100vh - 64px)",
        background:
          "radial-gradient(1200px 600px at 10% -20%, #1b255a33, transparent), #0b0f1e",
        padding: "32px 16px",
        color: "#fff", // 🔥 BU SATIR KRİTİK
      }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        {title && (
          <div style={{ marginBottom: 24 }}>
            <h1 style={{ fontSize: 28, fontWeight: 800 }}>{title}</h1>
            {subtitle && (
              <p style={{ opacity: 0.75, marginTop: 6 }}>{subtitle}</p>
            )}
          </div>
        )}

        <div
          style={{
            background: "rgba(255,255,255,.04)",
            border: "1px solid rgba(255,255,255,.12)",
            borderRadius: 16,
            padding: 20,
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
