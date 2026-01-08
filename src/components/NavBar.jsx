import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export default function NavBar() {
  const loc = useLocation();
  const nav = useNavigate();
  const [user, setUser] = React.useState(null);

  React.useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data?.user || null));
    const { data: sub } = supabase.auth.onAuthStateChange(async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data?.user || null);
    });
    return () => sub?.subscription?.unsubscribe?.();
  }, []);

  async function logout() {
    await supabase.auth.signOut();
    nav("/login");
  }

  const Item = ({ to, children }) => {
    const active = loc.pathname === to || loc.pathname.startsWith(to + "/");
    return (
      <Link to={to} style={link(active)}>
        {children}
      </Link>
    );
  };

  return (
    <div style={bar}>
      <div style={inner}>
        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <Link to="/" style={brand}>TradePiGloball</Link>

          <Item to="/pi/products">Products</Item>
          <Item to="/store">Stands</Item>
          <Item to="/rfqs">RFQs</Item>
          <Item to="/orders">Orders</Item>
          <Item to="/credits">Credits</Item>
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          {user ? (
            <>
              <span style={{ opacity: 0.8, fontSize: 12 }}>
                {user.email || user.id}
              </span>
              <button onClick={logout} style={btn2}>Logout</button>
            </>
          ) : (
            <button onClick={() => nav("/login")} style={btn}>
              Login
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

const bar = {
  position: "sticky",
  top: 0,
  zIndex: 10,
  background: "rgba(0,0,0,.75)",
  borderBottom: "1px solid rgba(255,255,255,.10)",
  backdropFilter: "blur(10px)",
};
const inner = { maxWidth: 1100, margin: "0 auto", padding: "10px 14px", display: "flex", justifyContent: "space-between", gap: 10 };
const brand = { color: "white", textDecoration: "none", fontWeight: 900, letterSpacing: 0.2 };
const link = (active) => ({
  color: "white",
  textDecoration: "none",
  padding: "8px 10px",
  borderRadius: 12,
  border: active ? "1px solid rgba(160,120,255,.55)" : "1px solid rgba(255,255,255,.10)",
  background: active ? "rgba(120,70,255,.22)" : "rgba(255,255,255,.04)",
  fontSize: 13,
  fontWeight: 800,
});
const btn = { padding: "8px 12px", borderRadius: 12, border: "none", background: "#6d5cff", color: "white", fontWeight: 900, cursor: "pointer" };
const btn2 = { padding: "8px 12px", borderRadius: 12, border: "1px solid rgba(255,255,255,.14)", background: "rgba(255,255,255,.06)", color: "white", fontWeight: 900, cursor: "pointer" };
