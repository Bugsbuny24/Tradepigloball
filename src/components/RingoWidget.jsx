import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export default function RingoWidget() {
  const nav = useNavigate();
  const loc = useLocation();

  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [role, setRole] = useState("anon"); // anon | buyer | company | owner
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Kanka ben Ringo. Ne yapmak istiyorsun? (RFQ / Stand / Admin / Sorun çözme)" },
  ]);
  const [input, setInput] = useState("");
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  // role detect
  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!data?.user) {
        setRole("anon");
        return;
      }

      // owner kontrolü: env ile (senin projede zaten var)
      const ownerEmails = (import.meta.env.VITE_OWNER_EMAILS || "").split(",").map(s => s.trim()).filter(Boolean);
      const email = data.user.email || "";
      if (ownerEmails.includes(email)) {
        setRole("owner");
        return;
      }

      // profil rolü (buyer/company)
      const { data: prof } = await supabase.from("profiles").select("role").eq("id", data.user.id).maybeSingle();
      setRole(prof?.role || "buyer");
    })();
  }, []);

  async function send() {
    const text = input.trim();
    if (!text || busy) return;

    setInput("");
    const next = [...messages, { role: "user", content: text }];
    setMessages(next);
    setBusy(true);

    try {
      const res = await fetch("/api/ringo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: next,
          context: {
            path: loc.pathname,
            role,
          },
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Ringo failed");

      // assistant reply
      if (json?.assistant) {
        setMessages((prev) => [...prev, { role: "assistant", content: json.assistant }]);
      }

      // actions
      const actions = json?.actions || [];
      for (const a of actions) {
        if (a.type === "navigate" && a.to) nav(a.to);
        if (a.type === "toast" && a.text) alert(a.text);
      }
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Kanka bir şey patladı: " + (e?.message || "unknown") },
      ]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ position: "fixed", right: 14, bottom: 14, zIndex: 9999, fontFamily: "system-ui" }}>
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          style={{
            padding: "12px 14px",
            borderRadius: 999,
            border: "1px solid rgba(255,255,255,0.22)",
            background: "rgba(120,70,255,0.55)",
            color: "white",
            fontWeight: 800,
            cursor: "pointer",
          }}
        >
          Ringo 🤖
        </button>
      ) : (
        <div
          style={{
            width: 340,
            maxWidth: "92vw",
            height: 460,
            borderRadius: 18,
            border: "1px solid rgba(255,255,255,0.18)",
            background: "rgba(10,10,20,0.92)",
            color: "white",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            boxShadow: "0 18px 60px rgba(0,0,0,.45)",
          }}
        >
          <div style={{ padding: 12, display: "flex", alignItems: "center", gap: 10, borderBottom: "1px solid rgba(255,255,255,0.12)" }}>
            <b>Ringo</b>
            <span style={{ opacity: 0.7, fontSize: 12 }}>({role} • {loc.pathname})</span>
            <button
              onClick={() => setOpen(false)}
              style={{ marginLeft: "auto", border: "none", background: "transparent", color: "white", cursor: "pointer", opacity: 0.8 }}
            >
              ✕
            </button>
          </div>

          <div style={{ padding: 12, overflowY: "auto", flex: 1 }}>
            {messages.map((m, i) => (
              <div key={i} style={{ marginBottom: 10, display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
                <div
                  style={{
                    maxWidth: "86%",
                    padding: "10px 12px",
                    borderRadius: 14,
                    background: m.role === "user" ? "rgba(120,70,255,0.55)" : "rgba(255,255,255,0.10)",
                    whiteSpace: "pre-wrap",
                    lineHeight: 1.35,
                  }}
                >
                  {m.content}
                </div>
              </div>
            ))}
            <div ref={endRef} />
          </div>

          <div style={{ padding: 12, borderTop: "1px solid rgba(255,255,255,0.12)", display: "flex", gap: 8 }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => (e.key === "Enter" ? send() : null)}
              placeholder={busy ? "Ringo düşünüyor…" : "Yaz ve Enter"}
              style={{
                flex: 1,
                padding: "10px 12px",
                borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.14)",
                background: "rgba(0,0,0,0.30)",
                color: "white",
                outline: "none",
              }}
            />
            <button
              onClick={send}
              disabled={busy}
              style={{
                padding: "10px 12px",
                borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.16)",
                background: busy ? "rgba(255,255,255,0.08)" : "rgba(120,70,255,0.55)",
                color: "white",
                cursor: busy ? "not-allowed" : "pointer",
                fontWeight: 800,
              }}
            >
              ▶
            </button>
          </div>
        </div>
      )}
    </div>
  );
                 }
