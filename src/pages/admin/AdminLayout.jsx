import { NavLink, Outlet } from "react-router-dom";

export default function AdminLayout() {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      
      {/* SIDEBAR */}
      <aside style={{
        width: 220,
        background: "#0b0b0b",
        color: "#fff",
        padding: 16
      }}>
        <h3>🛠 Admin</h3>

        <NavLink to="/admin" end>📊 Dashboard</NavLink><br />
        <NavLink to="/admin/audit">📜 Ledger</NavLink><br />
        <NavLink to="/admin/features">⚙️ Features</NavLink><br />
        <NavLink to="/admin/system">🧠 System</NavLink><br />
        <NavLink to="/admin/god">☠️ God Mode</NavLink>
      </aside>

      {/* CONTENT */}
      <main style={{ flex: 1, padding: 24 }}>
        <Outlet />
      </main>

    </div>
  );
}
