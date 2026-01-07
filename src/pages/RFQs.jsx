import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../lib/auth";

export default function RFQs() {
  const { user } = useAuth();
  const [rows, setRows] = useState([]);
  const [credits, setCredits] = useState(null);

  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
  const [budgetPi, setBudgetPi] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function load() {
    setErr(""); setMsg("");

    const { data: list, error: e1 } = await supabase
      .from("rfqs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);

    if (e1) setErr(e1.message);
    setRows(list || []);

    if (user) {
      await supabase.rpc("ensure_wallet");
      const { data: w, error: e2 } = await supabase
        .from("user_wallets")
        .select("credits")
        .eq("user_id", user.id)
        .single();
      if (!e2) setCredits(w?.credits ?? 0);
    } else setCredits(null);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  async function createPaid() {
    setErr(""); setMsg("");
    setBusy(true);
    try {
      if (!user) throw new Error("Login gerekli.");
      const bud = budgetPi === "" ? null : Number(budgetPi);

      const { data, error } = await supabase.rpc("create_rfq_paid", {
        p_title: title,
        p_details: details || null,
        p_budget_pi: Number.isFinite(bud) ? bud : null,
      });
      if (error) throw error;

      setMsg("RFQ açıldı ✅ id: " + data);
      setTitle(""); setDetails(""); setBudgetPi("");
      await load();
    } catch (e) {
      const m = e?.message || "Error";
      if (m.includes("not_enough_credits")) setErr("Kredi yok kanka 😄 Önce kredi yüklemen lazım.");
      else setErr(m);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <h1 style={{ marginTop: 0 }}>RFQs</h1>

      <div style={{ opacity: 0.85, marginBottom: 10 }}>
        RFQ açmak <b>1 kredi</b> yer.
      </div>

      <div style={box}>
        <div style={{ fontWeight: 800, marginBottom: 8 }}>
          {user ? (
            <>Credits: <span style={{ color: "rgba(180,255,180,.95)" }}>{credits ?? "..."}</span></>
          ) : (
            <>Login yapınca kredi görünür.</>
          )}
        </div>

        <div style={{ display: "grid", gap: 10, maxWidth: 420 }}>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="RFQ title" style={inp} />
          <textarea value={details} onChange={(e) => setDetails(e.target.value)} placeholder="Details" style={{ ...inp, minHeight: 90 }} />
          <input value={budgetPi} onChange={(e) => setBudgetPi(e.target.value)} placeholder="Budget (Pi) optional" style={inp} />

          <button onClick={createPaid} disabled={busy || !title} style={btn}>
            {busy ? "..." : "Create RFQ (1 credit)"}
          </button>
        </div>

        {msg ? <div style={{ marginTop: 10, color: "rgba(180,255,180,.95)" }}>{msg}</div> : null}
        {err ? <div style={{ marginTop: 10, color: "rgba(255,180,180,.95)" }}>{err}</div> : null}
      </div>

      <div style={{ marginTop: 14, display: "grid", gap: 10 }}>
        {(rows || []).map((r) => (
          <div key={r.id} style={row}>
            <div style={{ fontWeight: 900 }}>{r.title}</div>
            <div style={{ opacity: 0.8, marginTop: 4 }}>{r.details || "—"}</div>
            <div style={{ opacity: 0.7, marginTop: 6, fontSize: 12 }}>
              budget_pi: {r.budget_pi ?? "—"} • {new Date(r.created_at).toLocaleString()}
            </div>
          </div>
        ))}
        {(rows || []).length === 0 ? <div style={{ opacity: 0.7 }}>No RFQs yet.</div> : null}
      </div>
    </div>
  );
}

const box = {
  marginTop: 12,
  padding: 14,
  borderRadius: 14,
  background: "rgba(255,255,255,.06)",
  border: "1px solid rgba(255,255,255,.10)",
};

const row = {
  padding: 14,
  borderRadius: 14,
  background: "rgba(0,0,0,.18)",
  border: "1px solid rgba(255,255,255,.08)",
};

const inp = {
  padding: "10px 12px",
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,.14)",
  background: "rgba(0,0,0,.25)",
  color: "white",
  outline: "none",
};

const btn = {
  padding: "10px 12px",
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,.14)",
  background: "rgba(130,90,255,.35)",
  color: "white",
  fontWeight: 900,
  cursor: "pointer",
};
