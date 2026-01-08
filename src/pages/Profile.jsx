import React from "react";
import { supabase } from "../lib/supabaseClient";
import { getAuthDebug } from "../lib/debugAuth";

export default function Profile() {
  const [authDbg, setAuthDbg] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [err, setErr] = React.useState("");
  const [ok, setOk] = React.useState("");

  const [form, setForm] = React.useState({
    full_name: "",
    company_name: "",
    phone: "",
    country: "",
    pi_uid: "",
  });

  async function load() {
    setLoading(true);
    setErr("");
    setOk("");

    try {
      const dbg = await getAuthDebug();
      setAuthDbg(dbg);

      if (!dbg?.userId) throw new Error("Not authenticated. Login ol kanka.");

      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, company_name, phone, country, pi_uid, can_buy, can_sell, verified, is_verified_company")
        .eq("id", dbg.userId)
        .maybeSingle();

      if (error) throw error;

      setForm({
        full_name: data?.full_name || "",
        company_name: data?.company_name || "",
        phone: data?.phone || "",
        country: data?.country || "",
        pi_uid: data?.pi_uid || "",
      });
    } catch (e) {
      setErr(e?.message || "Load error");
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    load();
    const { data: sub } = supabase.auth.onAuthStateChange(() => load());
    return () => sub?.subscription?.unsubscribe?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onSave() {
    setSaving(true);
    setErr("");
    setOk("");
    try {
      const dbg = await getAuthDebug();
      setAuthDbg(dbg);
      if (!dbg?.userId) throw new Error("Not authenticated.");

      const patch = {
        full_name: form.full_name || null,
        company_name: form.company_name || null,
        phone: form.phone || null,
        country: form.country || null,
        pi_uid: form.pi_uid || null,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase.from("profiles").update(patch).eq("id", dbg.userId);
      if (error) throw error;

      setOk("Saved ✅");
    } catch (e) {
      setErr(e?.message || "Save error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ padding: 16, maxWidth: 720, margin: "0 auto" }}>
      <h2 style={{ margin: 0 }}>Profile</h2>
      <div style={{ opacity: 0.75, marginTop: 6 }}>Kendi profil bilgilerini güncelle.</div>

      <div style={dbgBox}>
        <b>Auth Debug</b>
        <div>userId: {authDbg?.userId ?? "-"}</div>
        <div>email: {authDbg?.email ?? "-"}</div>
      </div>

      {err ? <div style={errBox}><b>Hata:</b> {err}</div> : null}
      {ok ? <div style={okBox}>{ok}</div> : null}
      {loading ? <div style={{ marginTop: 12, opacity: 0.8 }}>Loading…</div> : null}

      {!loading ? (
        <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
          <input style={inp} value={form.full_name} onChange={(e) => setForm((p) => ({ ...p, full_name: e.target.value }))} placeholder="Full name" />
          <input style={inp} value={form.company_name} onChange={(e) => setForm((p) => ({ ...p, company_name: e.target.value }))} placeholder="Company name (optional)" />
          <input style={inp} value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} placeholder="Phone" />
          <input style={inp} value={form.country} onChange={(e) => setForm((p) => ({ ...p, country: e.target.value }))} placeholder="Country" />
          <input style={inp} value={form.pi_uid} onChange={(e) => setForm((p) => ({ ...p, pi_uid: e.target.value }))} placeholder="Pi UID (optional)" />

          <button onClick={onSave} disabled={saving} style={btn}>
            {saving ? "Saving..." : "Save"}
          </button>

          <div style={{ opacity: 0.7 }}>
            Not: Bu sayfa sadece <b>kendi profilini</b> update eder. (RLS: profiles_update_own)
          </div>
        </div>
      ) : null}
    </div>
  );
}

const inp = {
  padding: 12,
  borderRadius: 12,
  background: "rgba(0,0,0,.18)",
  color: "white",
  border: "1px solid rgba(255,255,255,.12)",
};
const btn = { padding: 12, borderRadius: 14, background: "#6d5cff", color: "white", border: "none", fontWeight: 800 };
const dbgBox = { margin: "12px 0", padding: 10, border: "1px dashed #555", borderRadius: 12 };
const errBox = { marginTop: 12, padding: 12, borderRadius: 12, border: "1px solid rgba(255,0,0,.25)", background: "rgba(255,0,0,.06)" };
const okBox = { marginTop: 12, padding: 12, borderRadius: 12, border: "1px solid rgba(0,255,0,.18)", background: "rgba(0,255,0,.06)" };
