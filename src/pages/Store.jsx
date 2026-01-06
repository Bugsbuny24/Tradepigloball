import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export default function Store() {
  const nav = useNavigate();

  const [loading, setLoading] = useState(true);
  const [companies, setCompanies] = useState([]);
  const [q, setQ] = useState("");
  const [err, setErr] = useState("");

  function toSlug(str) {
    return (str || "")
      .toString()
      .trim()
      .toLowerCase()
      .replaceAll("ı", "i")
      .replaceAll("ğ", "g")
      .replaceAll("ü", "u")
      .replaceAll("ş", "s")
      .replaceAll("ö", "o")
      .replaceAll("ç", "c")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }

  function normalizeUrl(url) {
    if (!url) return "";
    const s = String(url).trim();
    if (!s) return "";
    return s.startsWith("http://") || s.startsWith("https://") ? s : `https://${s}`;
  }

  const load = useCallback(async () => {
    setLoading(true);
    setErr("");

    const { data, error } = await supabase
      .from("company_applications")
      .select("id, user_id, company_name, country, website, status, created_at")
      .eq("status", "approved")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      setCompanies([]);
      setErr(error.message || "Load failed");
      setLoading(false);
      return;
    }

    setCompanies(data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return companies;

    return companies.filter((c) => {
      const name = (c.company_name || "").toLowerCase();
      const country = (c.country || "").toLowerCase();
      const website = (c.website || "").toLowerCase();
      return name.includes(s) || country.includes(s) || website.includes(s);
    });
  }, [companies, q]);

  function goStand(c) {
    const slug = toSlug(c.company_name) || c.user_id;
    nav(`/company/${slug}`);
  }

  return (
    <div style={{ maxWidth: 980, margin: "24px auto", padding: 16 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 12,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <h2 style={{ margin: 0 }}>Store (Approved Companies)</h2>

        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search company / country / website..."
            style={{
              padding: "10px 12px",
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.15)",
              background: "rgba(0,0,0,0.25)",
              minWidth: 240,
            }}
          />
          <button
            onClick={load}
            style={{
              padding: "10px 14px",
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.18)",
              background: "rgba(0,0,0,0.25)",
              cursor: "pointer",
            }}
          >
            Yenile
          </button>
        </div>
      </div>

      <div style={{ marginTop: 14 }}>
        {loading ? (
          <p>Yükleniyor…</p>
        ) : err ? (
          <p style={{ opacity: 0.85 }}>Hata: {err}</p>
        ) : filtered.length === 0 ? (
          <p>Henüz onaylı şirket yok.</p>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: 12,
              marginTop: 12,
            }}
          >
            {filtered.map((c) => {
              const href = normalizeUrl(c.website);

              return (
                <div
                  key={c.id}
                  style={{
                    border: "1px solid rgba(255,255,255,0.12)",
                    borderRadius: 16,
                    padding: 14,
                    background: "rgba(0,0,0,0.20)",
                  }}
                >
                  <div style={{ fontWeight: 900, marginBottom: 6 }}>{c.company_name || "Company"}</div>

                  <div style={{ opacity: 0.8, marginBottom: 10 }}>
                    {c.country || "—"} <span style={{ opacity: 0.5 }}>•</span> Verified
                  </div>

                  {href ? (
                    <div style={{ opacity: 0.85, marginBottom: 12, wordBreak: "break-word" }}>
                      Website:{" "}
                      <a href={href} target="_blank" rel="noreferrer" style={{ textDecoration: "underline" }}>
                        {href}
                      </a>
                    </div>
                  ) : (
                    <div style={{ opacity: 0.6, marginBottom: 12 }}>Website: —</div>
                  )}

                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <button
                      onClick={() => goStand(c)}
                      style={{
                        padding: "10px 14px",
                        borderRadius: 12,
                        border: "1px solid rgba(160,120,255,0.65)",
                        background: "rgba(120,70,255,0.45)",
                        cursor: "pointer",
                        fontWeight: 700,
                      }}
                    >
                      Vitrine gir
                    </button>

                    <button
                      onClick={() => nav("/pi/rfq/create")}
                      style={{
                        padding: "10px 14px",
                        borderRadius: 12,
                        border: "1px solid rgba(255,255,255,0.18)",
                        background: "rgba(0,0,0,0.25)",
                        cursor: "pointer",
                      }}
                    >
                      Create RFQ
                    </button>
                  </div>

                  <div style={{ marginTop: 12, borderTop: "1px solid rgba(255,255,255,0.10)", paddingTop: 10 }}>
                    <small style={{ opacity: 0.7 }}>
                      TradePiGloball is not a party to transactions. (Showroom only)
                    </small>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
