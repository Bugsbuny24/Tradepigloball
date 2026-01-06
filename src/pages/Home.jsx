import { useNavigate } from "react-router-dom";
import "./Home.css";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <div className="background-overlay"></div>

      {/* SADECE PI MODE */}
      <div className="mode-card pi-card">
        <div className="card-content">
          <div className="card-icon">
            <div className="pi-icon">
              <div className="pi-inner">
                <span className="pi-symbol">π</span>
              </div>
            </div>
          </div>

          <div className="card-info">
            <h1 className="mode-title">PI MODE</h1>
            <p className="mode-subtitle">Pi-Ecosystem B2B Showroom</p>

            <div className="button-group">
              <button
                className="mode-button pi-button"
                onClick={() => navigate("/pi/products")}
              >
                Browse Products
              </button>

              <button
                className="mode-button pi-button-secondary"
                onClick={() => navigate("/pi/rfq/create")}
              >
                Create RFQ
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* LOGIN */}
      <div style={{ textAlign: "center", marginTop: 50 }}>
        <button
          onClick={() => navigate("/login")}
          style={{
            padding: "14px 36px",
            borderRadius: 18,
            background: "linear-gradient(135deg, #6c4cff, #00e0ff)",
            color: "#fff",
            fontSize: 18,
            border: "none",
            cursor: "pointer",
            boxShadow: "0 12px 30px rgba(0,0,0,0.35)",
          }}
        >
          Giriş Yap
        </button>
      </div>
    </div>
  );
}
