import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export default function Login() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const onLogin = async (e) => {
    e.preventDefault();
    setErr("");
    setBusy(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErr(error.message || "Login failed");
      setBusy(false);
      return;
    }

    const uid = data?.user?.id;
    if (!uid) {
      setErr("No user id");
      setBusy(false);
      return;
    }

    const { data: p } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", uid)
      .single();

    // owner -> /owner, değilse -> /
    if (p?.role === "owner") nav("/owner", { replace: true });
    else nav("/", { replace: true });

    setBusy(false);
  };

  return (
    <div style={{ padding: 24, color: "#fff" }}>
      <h2>Login</h2>

      <form onSubmit={onLogin} style={{ display: "grid", gap: 12, maxWidth: 420 }}>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="email"
          style={{ padding: 12 }}
        />
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="password"
          type="password"
          style={{ padding: 12 }}
        />

        <button disabled={busy} style={{ padding: 12 }}>
          {busy ? "..." : "Giriş yap"}
        </button>

        {err ? <div style={{ color: "#ff8080" }}>{err}</div> : null}
      </form>

      <div style={{ marginTop: 16, display: "flex", gap: 10 }}>
        <button onClick={() => nav("/company/apply")} style={{ padding: 10 }}>
          Company Apply
        </button>
        <button onClick={() => nav("/buyer/signup")} style={{ padding: 10 }}>
          Buyer Signup
        </button>
      </div>
    </div>
  );
}
