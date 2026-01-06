import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export default function Register() {
  const nav = useNavigate();

  const [mode, setMode] = useState("buyer"); // buyer | company
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  // common
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // optional profile
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("");

  // company fields (required for company)
  const [companyName, setCompanyName] = useState("");
  const [website, setWebsite] = useState("");
  const [taxId, setTaxId] = useState("");

  async function handleRegister() {
    setErr("");
    setBusy(true);

    try {
      if (!email.trim() || !password) throw new Error("Email ve şifre gerekli.");

      if (mode === "company" && !companyName.trim()) {
        throw new Error("Company kayıt için Company Name zorunlu.");
      }

      // 1) Auth signup
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
      });

      if (error) throw error;

      const uid = data?.user?.id;
      if (!uid) throw new Error("Signup OK ama user id alınamadı.");

      // 2) profiles insert (tek kaynak burası)
      const profilePayload = {
        id: uid,
        role: "buyer",               // DB check constraint: buyer/company
        can_buy: true,
        can_sell: mode === "company", // company ise baştan “sell” açılır ama verified ayrı
        is_verified_company: false,
        full_name: fullName.trim() || null,
        company_name: mode === "company" ? companyName.trim() : null,
        phone: phone.trim() || null,
        country: country.trim() || null,
        updated_at: new Date().toISOString(),
      };

      const p = await supabase.from("profiles").upsert(profilePayload, { onConflict: "id" });
      if (p.error) throw p.error;

      // 3) company ise application aç (pending)
      if (mode === "company") {
        const appPayload = {
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

        const a = await supabase.from("company_applications").insert(appPayload);
        if (a.error) throw a.error;

        // Company başvurusu bekleme ekranı
        nav("/company/waiting", { replace: true });
        return;
      }

      // buyer ise login’e yönlendir
      alert("Kayıt OK. Email confirmation açıksa mailini kontrol et. Sonra login yap.");
      nav("/login", { replace: true });
    } catch (e) {
      setErr(e?.message || "Register failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ maxWidth: 720, margin: "24px auto", padding: 16 }}>
      <h1 style={{ marginTop: 0 }}>Register</h1>

      <div style={{ display: "flex", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
        <button
          onClick={() => setMode("buyer")}
          style={{
            padding: "10px 14px",
            borderRadius: 12,
            border: "1px solid rgba(0,0,0,.15)",
            background: mode === "buyer" ? "rgba(120,70,255,.12)" : "white",
            cursor: "pointer",
            fontWeight: 700,
          }}
        >
          Buyer Account
        </button>
        <button
          onClick={() => setMode("company")}
          style={{
            padding: "10px 14px",
            borderRadius: 12,
            border: "1px solid rgba(0,0,0,.15)",
            background: mode === "company" ? "rgba(120,70,255,.12)" : "white",
            cursor: "pointer",
            fontWeight: 700,
          }}
        >
          Company Apply
        </button>
      </div>

      <div style={{ display: "grid", gap: 10 }}>
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
        <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" type="password" />

        <input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Full name (optional)" />
        <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone (optional)" />
        <input value={country} onChange={(e) => setCountry(e.target.value)} placeholder="Country (optional)" />

        {mode === "company" ? (
          <>
            <hr />
            <h3 style={{ margin: "6px 0 0 0" }}>Company details</h3>
            <input
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Company Name (required)"
            />
            <input value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="Website (optional)" />
            <input value={taxId} onChange={(e) => setTaxId(e.target.value)} placeholder="Tax ID (optional)" />
            <div style={{ opacity: 0.75, fontSize: 13 }}>
              Başvuru “pending” olarak owner paneline düşer. Onaylanınca “Verified Stand” listesinde görünür.
            </div>
          </>
        ) : null}

        {err ? (
          <div style={{ padding: 10, border: "1px solid rgba(255,0,0,.25)", background: "rgba(255,0,0,.06)", borderRadius: 12 }}>
            {err}
          </div>
        ) : null}

        <button onClick={handleRegister} disabled={busy} style={{ padding: 12, borderRadius: 12, cursor: "pointer" }}>
          {busy ? "..." : mode === "company" ? "Create account + Apply" : "Create buyer account"}
        </button>

        <div style={{ marginTop: 8 }}>
          Hesabın var mı? <Link to="/login">Giriş</Link>
        </div>
      </div>
    </div>
  );
          }
