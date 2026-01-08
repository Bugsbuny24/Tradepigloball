import { Link, useLocation } from "react-router-dom";

export default function NavBar() {
  const { pathname } = useLocation();

  const Item = ({ to, label }) => (
    <Link
      to={to}
      style={{
        padding: "8px 14px",
        borderRadius: 999,
        background: pathname.startsWith(to)
          ? "linear-gradient(135deg,#7c5cff,#3dd6ff)"
          : "rgba(255,255,255,.06)",
        border: "1px solid rgba(255,255,255,.12)",
        color: "#fff",
        fontSize: 14,
        fontWeight: 600,
        opacity: pathname.startsWith(to) ? 1 : 0.85,
      }}
    >
      {label}
    </Link>
  );

  return (
    <div
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        backdropFilter: "blur(14px)",
        background: "rgba(10,14,30,.75)",
        borderBottom: "1px solid rgba(255,255,255,.12)",
      }}
    >
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "12px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        {/* Left */}
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <Link
            to="/"
            style={{
              fontWeight: 800,
              fontSize: 18,
              letterSpacing: 0.3,
            }}
          >
            TradePiGloball
          </Link>

          <Item to="/products" label="Products" />
          <Item to="/stand" label="Stands" />
          <Item to="/rfqs" label="RFQs" />
          <Item to="/orders" label="Orders" />
          <Item to="/credits" label="Credits" />
        </div>

        {/* Right */}
        <Link
          to="/login"
          style={{
            padding: "9px 16px",
            borderRadius: 999,
            background: "linear-gradient(135deg,#7c5cff,#3dd6ff)",
            color: "#fff",
            fontWeight: 700,
            fontSize: 14,
          }}
        >
          Login
        </Link>
      </div>
    </div>
  );
}
