import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

function nowTime() {
  const d = new Date();
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

const SYSTEM_HINTS = [
  "PI MODE showroom: ödeme/teslimat/iade yok, platform taraf değil.",
  "Companies (Verified Stands) sadece approved olanları gösterir.",
  "RFQ: alıcı talep açar, şirket teklif verir (Pi Testnet).",
];

function ringoReply(userText, context) {
  const t = (userText || "").toLowerCase();

  // hızlı kısayollar
  if (t.includes("link") || t.includes("panel") || t.includes("admin")) {
    return `Kanka linkler şunlar:
• PI MODE Ana: /
• Companies: /pi/products
• RFQ Create: /pi/rfq/create
• Admin Panel: /admin
• Ringo: /ringo`;
  }

  if (t.includes("rls") || t.includes("policy")) {
    return `RLS policy olayı: anon kullanıcıya sadece approved verileri gösteriyoruz. Böylece “Verified Stands” herkese açık ama güvenli kalıyor.`;
  }

  if (t.includes("stand") || t.includes("company")) {
    return `Stand mantığı: approved şirket listeden seçilir → /company/:slug sayfasına gider. Ürün yoksa bile RFQ açılabilir.`;
  }

  if (t.includes("beyaz") || t.includes("blank") || t.includes("white")) {
    return `Beyaz ekran %90 env/supabase yüzünden olur. VITE_SUPABASE_URL ve VITE_SUPABASE_ANON_KEY Vercel’de doğru mu?`;
  }

  // default cevap
  return `Ringo burda kanka 😄
Şu an bulunduğun sayfa: ${context.path}
Ne yapalım?
• “Admin panel linkleri”
• “RLS ne işe yarıyor?”
• “Stand niye loading’de kalır?”
• “Demo akışı söyle”`;
}

export default function Ringo() {
  const nav = useNavigate();
  const loc = useLocation();
  const listRef = useRef(null);

  const [input, setInput] = useState("");
  const [messages, setMessages] = useState(() => [
    {
      id: crypto?.randomUUID?.() || String(Math.random()),
      role: "ringo",
      text: "Kanka ben Ringo. Bu projedeyim artık 😄 Ne yapıyoruz?",
      at: nowTime(),
    },
  ]);

  const context = useMemo(() => ({ path: loc.pathname }), [loc.pathname]);

  useEffect(() => {
    // en alta kaydır
    listRef.current?.scrollTo?.(0, listRef.current.scrollHeight);
  }, [messages]);

  function send(text) {
    const trimmed = (text || "").trim();
    if (!trimmed) return;

    const uMsg = {
      id: crypto?.randomUUID?.() || String(Math.random()),
      role: "user",
      text: trimmed,
      at: nowTime(),
    };

    const rMsg = {
      id: crypto?.randomUUID?.() || String(Math.random()),
      role: "ringo",
      text: ringoReply(trimmed, context),
      at: nowTime(),
    };

    setMessages((prev) => [...prev, uMsg, rMsg]);
    setInput("");
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.topbar}>
          <div>
            <div style={styles.badge}>Ringo Assistant</div>
            <div style={styles.title}>Ringo</div>
            <div style={styles.sub}>TradePiGloball PI MODE demo asistanı</div>
          </div>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button style={styles.btn} onClick={() => nav("/pi/products")}>Companies</button>
            <button style={styles.btn} onClick={() => nav("/pi/rfq/create")}>Create RFQ</button>
            <button style={styles.btn} onClick={() => nav("/admin")}>Admin</button>
          </div>
        </div>

        <div style={styles.hints}>
          {SYSTEM_HINTS.map((h, i) => (
            <div key={i} style={styles.hintItem}>• {h}</div>
          ))}
        </div>

        <div ref={listRef} style={styles.chat}>
          {messages.map((m) => (
            <div key={m.id} style={m.role === "user" ? styles.userRow : styles.ringoRow}>
              <div style={m.role === "user" ? styles.userBubble : styles.ringoBubble}>
                <div style={{ opacity: 0.85, fontSize: 12, marginBottom: 6 }}>
                  {m.role === "user" ? "Sen" : "Ringo"} • {m.at}
                </div>
                <div style={{ whiteSpace: "pre-wrap" }}>{m.text}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={styles.inputRow}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder='Örn: "admin panel linkleri"'
            style={styles.input}
            onKeyDown={(e) => {
              if (e.key === "Enter") send(input);
            }}
          />
          <button style={styles.send} onClick={() => send(input)}>Gönder</button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { padding: 16, maxWidth: 980, margin: "0 auto" },
  card: {
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 18,
    padding: 14,
    background: "rgba(0,0,0,0.25)",
  },
  topbar: { display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center" },
  badge: {
    display: "inline-block",
    fontSize: 12,
    padding: "4px 10px",
    borderRadius: 999,
    border: "1px solid rgba(160,120,255,0.55)",
    marginBottom: 8,
  },
  title: { fontSize: 22, fontWeight: 900, marginBottom: 2 },
  sub: { opacity: 0.75, fontSize: 13 },
  btn: {
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.18)",
    background: "rgba(0,0,0,0.25)",
    cursor: "pointer",
    fontWeight: 700,
  },
  hints: {
    marginTop: 12,
    borderTop: "1px solid rgba(255,255,255,0.10)",
    paddingTop: 10,
    opacity: 0.85,
    display: "grid",
    gap: 6,
  },
  hintItem: { fontSize: 13 },
  chat: {
    marginTop: 12,
    height: 420,
    overflow: "auto",
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(0,0,0,0.20)",
    padding: 12,
  },
  userRow: { display: "flex", justifyContent: "flex-end", marginBottom: 10 },
  ringoRow: { display: "flex", justifyContent: "flex-start", marginBottom: 10 },
  userBubble: {
    maxWidth: "78%",
    borderRadius: 14,
    padding: 12,
    border: "1px solid rgba(120,70,255,0.55)",
    background: "rgba(120,70,255,0.25)",
  },
  ringoBubble: {
    maxWidth: "78%",
    borderRadius: 14,
    padding: 12,
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(0,0,0,0.25)",
  },
  inputRow: { display: "flex", gap: 10, marginTop: 12, flexWrap: "wrap" },
  input: {
    flex: "1 1 420px",
    padding: "12px 12px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.18)",
    background: "rgba(0,0,0,0.25)",
    color: "inherit",
    outline: "none",
  },
  send: {
    padding: "12px 14px",
    borderRadius: 12,
    border: "1px solid rgba(160,120,255,0.65)",
    background: "rgba(120,70,255,0.45)",
    cursor: "pointer",
    fontWeight: 900,
  },
};
