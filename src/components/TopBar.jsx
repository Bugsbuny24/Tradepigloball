import { useNavigate } from "react-router-dom";
import { signOut } from "../lib/session";

export default function TopBar({ title }) {
  const nav = useNavigate();

  return (
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"12px 0" }}>
      <h2 style={{ margin: 0 }}>{title}</h2>
      <div style={{ display:"flex", gap:8 }}>
        <button onClick={() => nav("/")}>Home</button>
        <button
          onClick={async () => {
            await signOut();
            nav("/login");
          }}
        >
          Çıkış
        </button>
      </div>
    </div>
  );
}
