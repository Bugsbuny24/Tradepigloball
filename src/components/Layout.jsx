import { Outlet } from "react-router-dom";
import TopBar from "./TopBar.jsx";

export default function Layout() {
  return (
    <div style={{ minHeight: "100vh" }}>
      <TopBar />
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: 16 }}>
        <Outlet />
      </div>
    </div>
  );
}
