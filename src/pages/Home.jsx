import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div
        style={{
          border: "1px solid #eee",
          borderRadius: 20,
          padding: 18,
          background: "white",
        }}
      >
        <div style={{ fontSize: 28, fontWeight: 900, lineHeight: 1.1 }}>
          Credit-powered RFQs
        </div>
        <div style={{ color: "#666", marginTop: 10, fontSize: 14, maxWidth: 750 }}>
          Create an RFQ, gather demand using Credits, and move to production when it
          makes sense. All actions use Credits. Credits are topped up via Pi.
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
          <Link to="/explore" style={btnPrimary}>Explore RFQs</Link>
          <Link to="/create" style={btnGhost}>Create RFQ</Link>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 12 }}>
        <Card title="Create RFQ (5 Credits)" text="Spam-proof. Serious requests only." />
        <Card title="Support (1 Credit each)" text="Boost demand and visibility." />
        <Card title="Featured RFQ" text="Pay Credits to appear on top." />
      </div>
    </div>
  );
}

const btnPrimary = {
  textDecoration: "none",
  background: "#111",
  color: "white",
  padding: "10px 12px",
  borderRadius: 14,
  fontWeight: 800,
  border: "1px solid #111",
};

const btnGhost = {
  textDecoration: "none",
  background: "white",
  color: "#111",
  padding: "10px 12px",
  borderRadius: 14,
  fontWeight: 800,
  border: "1px solid #eee",
};

function Card({ title, text }) {
  return (
    <div style={{ border: "1px solid #eee", borderRadius: 18, padding: 14, background: "white" }}>
      <div style={{ fontWeight: 900 }}>{title}</div>
      <div style={{ marginTop: 6, color: "#666", fontSize: 13 }}>{text}</div>
    </div>
  );
