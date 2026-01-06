import { Link } from "react-router-dom";
import { useSession, signOut } from "../lib/session";

export default function Header() {
  const { user } = useSession();

  return (
    <header style={styles.header}>
      <Link to="/" style={styles.logo}>
        TradePiGlobal
      </Link>

      <nav style={styles.nav}>
        {!user && (
          <Link to="/login" style={styles.link}>
            Giriş Yap
          </Link>
        )}

        {user && (
          <>
            <Link to="/panel" style={styles.link}>
              Panel
            </Link>
            <button onClick={signOut} style={styles.button}>
              Çıkış
            </button>
          </>
        )}
      </nav>
    </header>
  );
}

const styles = {
  header: {
    display: "flex",
    justifyContent: "space-between",
    padding: "14px 18px",
    background: "#0b0b1e",
    color: "#fff",
  },
  logo: {
    color: "#fff",
    textDecoration: "none",
    fontWeight: "600",
    fontSize: "16px",
  },
  nav: {
    display: "flex",
    gap: "12px",
    alignItems: "center",
  },
  link: {
    color: "#fff",
    textDecoration: "none",
  },
  button: {
    background: "transparent",
    color: "#fff",
    border: "1px solid #555",
    padding: "4px 8px",
    cursor: "pointer",
  },
};
