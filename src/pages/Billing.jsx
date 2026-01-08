import React from "react";
import supabase from "../lib/supabaseClient";

function Card({ title, children, right }) {
  return (
    <div style={S.card}>
      <div style={S.cardTop}>
        <div style={{ fontWeight: 900 }}>{title}</div>
        {right}
      </div>
      <div style={{ marginTop: 10 }}>{children}</div>
    </div>
  );
}

export default function Billing() {
  const [me, setMe] = React.useState(null);
  const [sub, setSub] = React.useState(null);
  const [plans, setPlans] = React.useState([]);
  const [credits, setCredits] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [err, setErr] = React.useState("");

  async function load() {
    setLoading(true);
    setErr("");

    const { data: auth } = await supabase.auth.getUser();
    if (!auth?.user) {
      setErr("Login gerekli.");
      setLoading(false);
      return;
    }
    setMe(auth.user);

    const [s1, s2, s3] = await Promise.all([
      supabase.from("subscriptions").select("*").eq("user_id", auth.user.id).maybeSingle(),
      supabase.from("plans").select("*").order("price_pi_monthly", { ascending: true }),
      // Credits için sende hangisi aktifse onu kullan:
      // 1) credits.balance:
      supabase.from("credits").select("balance").eq("user_id", auth.user.id).maybeSingle(),
    ]);

    if (s1.error) setErr(s1.error.message);
    setSub(s1.data || null);

    if (s2.error) setErr(s2.error.message);
    setPlans(s2.data || []);

    if (s3.error) {
      // credits tablosu yoksa fallback user_wallets:
      const w = await supabase.from("user_wallets").select("balance").eq("user_id", auth.user.id).maybeSingle();
      if (!w.error) setCredits(w.data?.balance ?? 0);
      else setCredits(0);
    } else {
      setCredits(s3.data?.balance ?? 0);
    }

    setLoading(false);
  }

  React.useEffect(() => {
    load();
  }, []);

  return (
    <div style={S.page}>
      <div style={S.hero}>
        <div>
          <div style={S.h1}>Billing</div>
          <div style={S.subtext}>
            Premium features are unlocked by plan + credits. Payments are done via Pi Network.
          </div>
        </div>
        <button onClick={load} style={S.btn}>Refresh</button>
      </div>

      {err ? <div style={S.err}><b>Hata:</b> {err}</div> : null}
      {loading ? <div style={{ marginTop: 10 }}>Loading...</div> : null}

      {!loading && (
        <div style={S.grid}>
          <Card title="Subscription" right={<span style={S.badge}>{sub?.status || "inactive"}</span>}>
            <div style={{ opacity: 0.85 }}>
              Current status: <b>{sub?.status || "inactive"}</b>
            </div>
            <div style={{ marginTop: 10, opacity: 0.75, fontSize: 12 }}>
              (Next step) Plan purchase creates an order → pay with Pi → subscription activated.
            </div>
          </Card>

          <Card title="Credits" right={<span style={S.badge}>{credits === null ? "…" : credits}</span>}>
            <div style={{ opacity: 0.85 }}>
              Credits are spent on premium actions (RFQ create, Offer submit, Featured, etc.)
            </div>
            <div style={{ marginTop: 10, opacity: 0.75, fontSize: 12 }}>
              (Next step) Credits pack purchase creates an order → pay with Pi → credits granted.
            </div>
          </Card>

          <Card title="Plans">
            {plans.length === 0 ? (
              <div style={{ opacity: 0.8 }}>No plans.</div>
            ) : (
              <div style={{ display: "grid", gap: 10 }}>
                {plans.map((p) => (
                  <div key={p.id} style={S.planRow}>
                    <div>
                      <div style={{ fontWeight: 900 }}>{p.name}</div>
                      <div style={{ opacity: 0.75, fontSize: 12, marginTop: 4 }}>
                        Product limit: {p.product_limit} • RFQ responses included: {p.rfq_responses_included} • Featured: {p.featured_included ? "Yes" : "No"}
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontWeight: 900 }}>{p.price_pi_monthly} Pi/mo</div>
                      <button disabled style={S.disabledBtn}>Buy with Pi</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}

const S = {
  page: { padding: 16, maxWidth: 980, margin: "0 auto" },
  hero: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" },
  h1: { fontSize: 22, fontWeight: 900 },
  subtext: { opacity: 0.8, marginTop: 6 },
  btn: { padding: "10px 14px", borderRadius: 12, border: "1px solid rgba(255,255,255,.14)", background: "rgba(255,255,255,.06)", color: "white", cursor: "pointer", fontWeight: 800 },
  err: { marginTop: 12, padding: 12, borderRadius: 14, border: "1px solid rgba(255,0,80,.25)", background: "rgba(255,0,80,.08)" },
  grid: { marginTop: 12, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 12 },
  card: { padding: 14, borderRadius: 16, border: "1px solid rgba(255,255,255,.12)", background: "rgba(0,0,0,.22)" },
  cardTop: { display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" },
  badge: { padding: "6px 10px", borderRadius: 999, border: "1px solid rgba(255,255,255,.14)", background: "rgba(255,255,255,.06)", fontSize: 12, fontWeight: 900 },
  planRow: { display: "flex", justifyContent: "space-between", gap: 12, padding: 12, borderRadius: 14, border: "1px solid rgba(255,255,255,.10)", background: "rgba(255,255,255,.04)" },
  disabledBtn: { marginTop: 8, padding: "9px 12px", borderRadius: 12, border: "1px solid rgba(255,255,255,.10)", background: "rgba(255,255,255,.05)", color: "rgba(255,255,255,.5)" },
};
