import { useMemo, useState } from "react";
import { ADMIN_RESOURCES } from "./adminResources";
import AdminResource from "./AdminResource";

export default function AdminDashboard() {
  const [active, setActive] = useState(ADMIN_RESOURCES[0]?.key || "profiles");
  const resource = useMemo(() => ADMIN_RESOURCES.find((r) => r.key === active), [active]);

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <aside style={{ width: 280, borderRight: "1px solid rgba(0,0,0,.12)", padding: 14 }}>
        <div style={{ fontWeight: 800, fontSize: 18 }}>TradePiGloball Admin</div>
        <div style={{ opacity: 0.7, marginTop: 6 }}>Full control panel</div>

        <div style={{ marginTop: 14, display: "grid", gap: 8 }}>
          {ADMIN_RESOURCES.map((r) => (
            <button
              key={r.key}
              onClick={() => setActive(r.key)}
              style={{
                textAlign: "left",
                padding: "10px 12px",
                borderRadius: 10,
                border: "1px solid rgba(0,0,0,.12)",
                background: active === r.key ? "rgba(0,0,0,.07)" : "white",
                cursor: "pointer",
              }}
            >
              {r.title}
            </button>
          ))}
        </div>
      </aside>

      <main style={{ flex: 1, padding: 18 }}>
        {resource ? <AdminResource resource={resource} /> : <div>No resource.</div>}
      </main>
    </div>
  );
}
