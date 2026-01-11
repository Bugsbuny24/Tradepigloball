import { Outlet, NavLink } from "react-router-dom";

export default function AdminLayout() {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      
      <aside style={{
        width: 240,
        background: "#020617",
        color: "#fff",
        padding: 16
      }}>
        <h3>🧠 ADMIN</h3>

        <NavLink to="/admin"        >📊 Dashboard</NavLink><br/>
        <NavLink to="/admin/features">🎛 Features</NavLink><br/>
        <NavLink to="/admin/system" >⚙️ System</NavLink><br/>
        <NavLink to="/admin/audit"  >📜 Audit</NavLink><br/>
        <NavLink to="/admin/god"    style={{color:"red"}}>
          ☠ GOD MODE
        </NavLink>
      </aside>

      <main style={{ flex: 1, padding: 24 }}>
        <Outlet />
      </main>
    </div>
  );
}
