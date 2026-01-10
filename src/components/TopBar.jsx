import { Link, NavLink } from "react-router-dom";

const navStyle = ({ isActive }) => ({
  padding: "8px 10px",
  borderRadius: 10,
  textDecoration: "none",
  color: isActive ? "white" : "#111",
  background: isActive ? "#111" : "transparent",
});

export default function TopBar() {
  // Şimdilik mock user + credit
  const user = { handle: "onur", credits: 120 };

  return (
    <div style={{ borderBottom: "1px solid #eee", background: "white" }}>
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "12px 16px",
          display: "flex",
          alignItems: "center",
          gap: 12,
          justifyContent: "space-between",
        }}
      >
        <Link to="/" style={{ textDecoration: "none", color: "#111" }}>
          <div style={{ fontWeight: 800, letterSpacing: 0.3 }}>
            TradePiGloball
          </div>
          <div style={{ fontSize: 12, color: "#666" }}>
            Credit-powered RFQ platform
          </div>
        </Link>

        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <NavLink to="/explore" style={navStyle}>Explore</NavLink>
          <NavLink to="/create" style={navStyle}>Create RFQ</NavLink>
          <NavLink to="/dashboard" style={navStyle}>Dashboard</NavLink>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              padding: "8px 10px",
              borderRadius: 12,
              border: "1px solid #eee",
              background: "#fafafa",
              fontSize: 13,
            }}
            title="All actions use Credits"
          >
            <b>{user.credits}</b> Credits
          </div>

          <button
            style={{
              border: "1px solid #111",
              background: "#111",
              color: "white",
              padding: "8px 10px",
              borderRadius: 12,
              cursor: "pointer",
              fontWeight: 700,
            }}
            onClick={() => alert("Top up coming soon (Pi → Credit).")}
          >
            Top up
          </button>
        </div>
      </div>
    </div>
  );
}
