import { Link } from "react-router-dom";

export default function NavBar() {
  return (
    <nav style={styles.nav}>
      <div style={styles.logo}>TradePi</div>
      <div style={styles.links}>
        <Link to="/" style={styles.link}>Home</Link>
        <Link to="/products" style={styles.link}>Products</Link>
        <Link to="/login" style={styles.link}>Login</Link>
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    display: "flex",
    justifyContent: "space-between",
    padding: "12px 20px",
    background: "#000",
    color: "#fff"
  },
  logo: { fontWeight: "bold" },
  links: { display: "flex", gap: "15px" },
  link: { color: "#fff", textDecoration: "none" }
};
