import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { getAuthDebug } from "../lib/debugAuth";
import { spendCredit } from "../lib/credits";

export default function RFQs() {
  const [auth, setAuth] = useState({ userId: null, email: null });
  const [credits, setCredits] = useState(0);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [notes, setNotes] = useState("");
  const [isBusy, setIsBusy] = useState(false);

  const [rfqs, setRfqs] = useState([]);

  const styles = useMemo(() => {
    const page = {
      minHeight: "calc(100vh - 64px)",
      padding: "22px 14px",
      background:
        "radial-gradient(900px 520px at 20% 0%, rgba(99,102,241,.22), transparent 60%), radial-gradient(900px 520px at 80% 10%, rgba(34,197,94,.16), transparent 55%), linear-gradient(180deg, rgba(15,23,42,1), rgba(2,6,23,1))",
      color: "#e5e7eb",
    };

    const wrap = { maxWidth: 1100, margin: "0 auto" };

    const headerRow = {
      display: "flex",
      alignItems: "flex-end",
      justifyContent: "space-between",
      gap: 12,
      flexWrap: "wrap",
      marginBottom: 14,
    };

    const h1 = { margin: 0, fontSize: 28, letterSpacing: 0.2 };
    const sub = { opacity: 0.85, marginTop: 6, lineHeight: 1.5 };

    const grid = {
      display: "grid",
      gridTemplateColumns: "1fr",
      gap: 14,
    };

    const card = {
      border: "1px solid rgba(255,255,255,.10)",
      background:
        "linear-gradient(180deg, rgba(255,255,255,.06), rgba(255,255,255,.03))",
      borderRadius: 18,
      padding: 16,
      boxShadow: "0 14px 40px rgba(0,0,0,.35)",
      backdropFilter: "blur(10px)",
    };

    const badgeRow = { display: "flex", gap: 10, flexWrap: "wrap" };
    const badge = {
      fontSize: 12,
      padding: "6px 10px",
      borderRadius: 999,
      border: "1px solid rgba(255,255,255,.14)",
      background: "rgba(255,255,255,.06)",
    };

    const formRow = { display: "grid", gap: 10 };
    const input = {
      width: "100%",
      padding: "12px 12px",
      borderRadius: 12,
      border: "1px solid rgba(255,255,255,.14)",
      background: "rgba(255,255,255,.06)",
      color: "#e5e7eb",
      outline: "none",
    };

    const textarea = { ...input, minHeight: 110, resize: "vertical" };

    const btn = (primary = false) => ({
      padding: "12px 14px",
      borderRadius: 12,
      border: "1px solid rgba(255,255,255,.14)",
      background: primary
        ? "linear-gradient(90deg, rgba(99,102,241,.95), rgba(34,197,94,.65))"
        : "rgba(255,255,255,.06)",
      color: "#0b1020",
      fontWeight: 800,
      cursor: "pointer",
      opacity: isBusy ? 0.65 : 1,
    });

    const list = { display: "grid", gap: 10, marginTop: 10 };
    const item = {
      display: "flex",
      justifyContent: "space-between",
      gap: 10,
      padding: 12,
      borderRadius: 14,
      border: "1px solid rgba(255,255,255,.10)",
      background: "rgba(255,255,255,.04)",
      textDecoration: "none",
      color: "#e5e7eb",
    };

    const itemTitle = { margin: 0, fontWeight: 800 };
    const itemMeta = { fontSize: 12, opacity: 0.8, marginTop: 4 };
    const right = { textAlign: "right", fontSize: 12, opacity: 0.8 };

    return {
      page,
      wrap,
      headerRow,
      h1,
      sub,
      grid,
      card,
      badgeRow,
      badge,
      formRow,
      input,
      textarea,
      btn,
      list,
      item,
      itemTitle,
      itemMeta,
      right,
    };
  }, [isBusy]);

  async function loadCredits(uid) {
    if (!uid) return;
    const { data, error } = await supabase
      .from("credit_ledger")
      .select("amount")
      .eq("user_id", uid);

    if (error) return;
    const sum = (data || []).reduce((acc, x) => acc + (x.amount || 0), 0);
    setCredits(sum);
  }

  async function loadRfqs(uid) {
    if (!uid) return;
    const { data, error } = await supabase
      .from("rfqs")
      .select("id,title,status,created_at,buyer_id,owner_id")
      .order("created_at", { ascending: false });

    if (error) return;

    // Buyer kendi RFQlarını görsün; istersen burada filtreyi kaldırabiliriz.
    const mine = (data || []).filter(
      (r) => r.buyer_id === uid || r.owner_id === uid
    );
    setRfqs(mine);
  }

  async function refreshAll(uid) {
    await Promise.all([loadCredits(uid), loadRfqs(uid)]);
  }

  useEffect(() => {
    (async () => {
      const a = await getAuthDebug();
      setAuth(a);
      await refreshAll(a.userId);

      supabase.auth.onAuthStateChange(async (_event, session) => {
        const uid = session?.user?.id || null;
        const email = session?.user?.email || null;
        setAuth({ userId: uid, email });
        await refreshAll(uid);
      });
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function createRfq() {
    if (!auth.userId) return alert("Login olman lazım.");
    if (!title.trim()) return alert("Başlık boş olamaz.");

    setIsBusy(true);
    try {
      // 1) kredi düş
      await spendCredit("RFQ_CREATE", 1, `RFQ create: ${title}`);

      // 2) RFQ insert
      const payload = {
        title: title.trim(),
        description: description?.trim() || null,
        notes: notes?.trim() || null,
        status: "open",
        // buyer_id default auth.uid() ama garanti olsun:
        buyer_id: auth.userId,
        owner_id: auth.userId,
      };

      const { error } = await supabase.from("rfqs").insert(payload);
      if (error) throw error;

      setTitle("");
      setDescription("");
      setNotes("");
      alert("RFQ created ✅");
      await refreshAll(auth.userId);
    } catch (e) {
      alert(e?.message || "RFQ create error");
    } finally {
      setIsBusy(false);
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.wrap}>
        <div style={styles.headerRow}>
          <div>
            <h2 style={styles.h1}>RFQs</h2>
            <div style={styles.sub}>
              RFQ açmak <b>1 kredi</b> yer. Satıcılar birbirinin teklifini görmez.
            </div>
          </div>

          <div style={styles.badgeRow}>
            <div style={styles.badge}>
              Credits: <b>{credits}</b>
            </div>
            <div style={styles.badge}>
              Auth:{" "}
              <b style={{ fontFamily: "monospace" }}>
                {auth.userId ? auth.userId.slice(0, 8) + "…" : "null"}
              </b>
            </div>
            <div style={styles.badge}>{auth.email || "no-email"}</div>
          </div>
        </div>

        <div style={styles.grid}>
          <div style={styles.card}>
            <div style={{ fontWeight: 900, marginBottom: 10 }}>
              Create new RFQ
            </div>
            <div style={styles.formRow}>
              <input
                style={styles.input}
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <textarea
                style={styles.textarea}
                placeholder="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <textarea
                style={{ ...styles.textarea, minHeight: 70 }}
                placeholder="Notes (opsiyonel)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
              <button style={styles.btn(true)} onClick={createRfq} disabled={isBusy}>
                {isBusy ? "Working..." : "Create RFQ (1 credit)"}
              </button>
            </div>
          </div>

          <div style={styles.card}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div style={{ fontWeight: 900 }}>My RFQs</div>
              <div style={{ fontSize: 12, opacity: 0.8 }}>
                Total: <b>{rfqs.length}</b>
              </div>
            </div>

            <div style={styles.list}>
              {rfqs.length === 0 ? (
                <div style={{ opacity: 0.75, padding: 10 }}>No RFQs yet.</div>
              ) : (
                rfqs.map((r) => (
                  <Link key={r.id} style={styles.item} to={`/rfqs/${r.id}`}>
                    <div>
                      <p style={styles.itemTitle}>{r.title || "Untitled"}</p>
                      <div style={styles.itemMeta}>
                        Status: <b>{r.status}</b> •{" "}
                        {r.created_at ? new Date(r.created_at).toLocaleString() : "-"}
                      </div>
                    </div>
                    <div style={styles.right}>
                      <div>Open</div>
                      <div style={{ opacity: 0.7 }}>Detail →</div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>

        <div style={{ marginTop: 12, opacity: 0.7, fontSize: 12 }}>
          Not: Bu sürüm “showroom/RFQ demo”. Gerçek ödeme yok.
        </div>
      </div>
    </div>
  );
  }
