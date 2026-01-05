import { useNavigate } from "react-router-dom";
import "./Home.css";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <div className="background-overlay"></div>

      {/* USD MODE */}
      <div className="mode-card usd-card">
        <div className="card-content">
          <div className="card-icon">
            <div className="globe-icon">
              <div className="globe-inner">
                <span className="dollar-sign">$</span>
              </div>
            </div>
          </div>

          <div className="card-info">
            <h1 className="mode-title">USD MODE</h1>
            <p className="mode-subtitle">Global B2B Trade</p>
            <button
              className="mode-button usd-button"
              onClick={() => navigate("/usd")}
            >
              Enter USD Mode
            </button>
          </div>
        </div>
      </div>

      {/* PI MODE */}
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
                onClick={() => navigate("/pi/rfq")}
              >
                Create RFQ
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* EXPO CITY */}
      <div className="mode-card expo-card">
        <div className="card-content">
          <div className="card-icon">
            <div className="expo-icon">
              <div className="city-skyline">
                <div className="building"></div>
                <div className="building tall"></div>
                <div className="building"></div>
              </div>
              <div className="flags">
                <span className="flag">🇹🇷</span>
                <span className="flag">🇺🇸</span>
                <span className="flag">🇩🇪</span>
              </div>
            </div>
          </div>

          <div className="card-info">
            <h1 className="mode-title">EXPO CITY</h1>
            <p className="mode-subtitle">Digital Trade Pavilion</p>
            <button
              className="mode-button expo-button"
              onClick={() => navigate("/expo-city")}
            >
              Enter Expo City
            </button>
          </div>
        </div>
      </div>

      {/* 🔑 LOGIN BUTTON (EN GARANTİ YOL) */}
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
          <a href="/login">
  <button>Giriş Yap</button>
</a>
