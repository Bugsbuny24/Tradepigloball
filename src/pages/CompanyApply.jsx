import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useNavigate } from "react-router-dom";

export default function CompanyApply() {
  const nav = useNavigate();
  const [loading, setLoading] = useState(true);
  const [companyName, setCompanyName] = useState("");
  const [taxNo, setTaxNo] = useState("");
  const [country, setCountry] = useState("Türkiye");
  const [city, setCity] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError("");

      const { data: auth } = await supabase.auth.getUser();
      const uid = auth?.user?.id;
      if (!uid) {
        nav("/login", { replace: true });
        return;
      }

      // Daha önce başvurmuş mu?
      const { data: row, error: e } = await supabase
        .from("company_profiles")
        .select("status")
        .eq("user_id", uid)
        .maybeSingle();

      if (e) {
        setError(e.message);
      } else if (row?.status === "pending") {
        nav("/company/waiting", { replace: true });
        return;
      } else if (row?.status === "approved") {
        nav("/company", { replace: true });
        return;
      }

      setLoading(false);
    })();
  }, [nav]);

  const submit = async (ev) => {
    ev.preventDefault();
    setError("");

    if (!accepted) {
      setError("Devam etmek için şartları kabul etmelisin.");
      return;
    }
    if (!companyName.trim()) {
      setError("Company name zorunlu.");
      return;
    }

    const { data: auth } = await supabase.auth.getUser();
    const uid = auth?.user?.id;
    if (!uid) return nav("/login", { replace: true });

    // Not: status alanın enum ise değerler 'pending/approved/rejected' olmalı.
    const payload = {
      user_id: uid,
      company_name: companyName.trim(),
      tax_no: taxNo.trim() || null,
      country: country.trim() || null,
      city: city.trim() || null,
      is_verified: false,
      status: "pending",
    };

    const { error: e } = await supabase
      .from("company_profiles")
      .upsert(payload, { onConflict: "user_id" });

    if (e) {
      setError(e.message);
      return;
    }

    nav("/company/waiting", { replace: true });
  };

  if (loading) return <div style={{ padding: 24 }}>Loading...</div>;

  return (
    <div style={{ maxWidth: 520, margin: "0 auto", padding: 24 }}>
      <h2>Company Apply</h2>

      {error && (
        <div style={{ background: "#ffefef", padding: 12, borderRadius: 8, marginTop: 12 }}>
          {error}
        </div>
      )}

      <form onSubmit={submit} style={{ marginTop: 16, display: "grid", gap: 10 }}>
        <input
          placeholder="Company name *"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
        />
        <input
          placeholder="Tax no (opsiyonel)"
          value={taxNo}
          onChange={(e) => setTaxNo(e.target.value)}
        />
        <input
          placeholder="Country"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
        />
        <input
          placeholder="City"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />

        <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input type="checkbox" checked={accepted} onChange={(e) => setAccepted(e.target.checked)} />
          <span>Şartlar & uyarı metnini okudum, kabul ediyorum.</span>
        </label>

        <button type="submit">Başvur</button>
      </form>
    </div>
  );
      }
