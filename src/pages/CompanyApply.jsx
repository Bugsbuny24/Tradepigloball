import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export default function CompanyApply() {
  const nav = useNavigate();
  const [companyName, setCompanyName] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!data?.user) nav("/login", { replace: true });
    })();
  }, [nav]);

  const submit = async () => {
    setMsg("");
    setBusy(true);

    const { data: auth } = await supabase.auth.getUser();
    const uid = auth?.user?.id;
    if (!uid) {
      setBusy(false);
      setMsg("Login required");
      return;
    }

    // varsa güncelle, yoksa insert
    const payload = {
      user_id: uid,
      company_name: companyName.trim(),
      status: "pending",
      is_verified: false,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from("company_profiles")
      .upsert(payload, { onConflict: "user_id" });

    if (error) {
      setMsg(error.message);
      setBusy(false);
      return;
    }

    nav("/company/waiting", { replace: true });
    setBusy(false);
  };

  return (
    <div style={{ padding: 24, color: "#fff" }}>
      <h2>Company Apply</h2>
      <div style={{ display: "grid", gap: 12, maxWidth: 520 }}>
        <input
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          placeholder="Company name"
          style={{ padding: 12 }}
        />
        <button disabled={busy || !companyName.trim()} onClick={submit} style={{ padding: 12 }}>
          {busy ? "..." : "Submit"}
        </button>
        {msg ? <div style={{ color: "#ff8080" }}>{msg}</div> : null}
      </div>
    </div>
  );
}
