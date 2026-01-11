import { Outlet, NavLink } from "react-router-dom";

export default function AdminLayout() {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <aside style={{ width: 220, background: "#111", color: "#fff", padding: 20 }}>
        <h3>ADMIN</h3>
        <nav>
          <NavLink to="/admin" end>Dashboard</NavLink><br />
          <NavLink to="/admin/users">Users</NavLink><br />
          <NavLink to="/admin/rfq">RFQs</NavLink><br />
          <NavLink to="/admin/system">System</NavLink>
        </nav>
      </aside>

      <main style={{ flex: 1, padding: 24 }}>
        <Outlet />
      </main>
    </div>
  );
}
