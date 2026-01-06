import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export default function CompanyApply() {
  const nav = useNavigate();

  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const [fullName, setFullName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("");
  const [website, setWebsite] = useState("");
  const [taxId, setTaxId] = useState("");

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!data?.user) nav("/login", { replace: true });
    })();
  }, [nav]);

  const submit = async () => {
    setMsg("");
    setBusy(true);

    try {
      const { data: auth } = await supabase.auth.getUser();
      const uid = auth?.user?.id;
      if (!uid) throw new Error("Login required");

      if (!companyName.trim()) throw new Error("Company name required");

      const payload = {
        user_id: uid,
        full_name: fullName.trim() || null,
        company_name: companyName.trim(),
        phone: phone.trim() || null,
        country: country.trim() || null,
        website: website.trim() || null,
        tax_id: taxId.trim() || null,
        status: "pending",
        admin_note: null,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase.from("company_applications").insert(payload);
      if (error) throw error;

      // profile güncelle (company_name vb.)
      await supabase.from("profiles").update({
        company_name: companyName.trim(),
        full_name: fullName.trim() || null,
        phone: phone.trim() || null,
        country: country.trim() || null,
        updated_at: new Date().toISOString(),
      }).eq("id", uid);

      nav("/company/waiting", { replace: true });
    } catch (e) {
      setMsg(e?.message || "Apply failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ maxWidth: 720, margin: "24px auto", padding: 16 }}>
      <h2>Company Apply</h2>

      <div style={{ display: "grid", gap: 10 }}>
        <input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Full name" />
        <input value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Company name (required)" />
        <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone" />
        <input value={country} onChange={(e) => setCountry(e.target.value)} placeholder="Country" />
        <input value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="Website" />
        <input value={taxId} onChange={(e) => setTaxId(e.target.value)} placeholder="Tax ID" />

        <button disabled={busy} onClick={submit} style={{ padding: 12, borderRadius: 12 }}>
          {busy ? "..." : "Submit application"}
        </button>

        {msg ? <div style={{ opacity: 0.85 }}>{msg}</div> : null}
      </div>
    </div>
  );
}
