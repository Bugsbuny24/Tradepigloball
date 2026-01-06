import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

/**
 * /pi/products
 * - Products tab (şimdilik placeholder; sende zaten varsa içine geri koyarız)
 * - Companies tab: company_applications tablosundan status='approved' olanları listeler
 */

export default function PiProducts() {
  const navigate = useNavigate();

  const [tab, setTab] = useState("products"); // 'products' | 'companies'
  const [loadingCompanies, setLoadingCompanies] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [companySearch, setCompanySearch] = useState("");

  // Companies çek
  useEffect(() => {
    if (tab !== "companies") return;

    let isMounted = true;

    async function fetchCompanies() {
      setLoadingCompanies(true);
      const { data, error } = await supabase
        .from("company_applications")
        .select("id, user_id, company_name, country, website, status, created_at")
        .eq("status", "approved")
        .order("created_at", { ascending: false });

      if (!isMounted) return;

      if (error) {
        console.error("fetchCompanies error:", error);
        setCompanies([]);
      } else {
        setCompanies(data || []);
      }
      setLoadingCompanies(false);
    }

    fetchCompanies();

    return () => {
      isMounted = false;
    };
  }, [tab]);

  const filteredCompanies = useMemo(() => {
    const q = companySearch.trim().toLowerCase();
    if (!q) return companies;

    return companies.filter((c) => {
      const name = (c.company_name || "").toLowerCase();
      const country = (c.country || "").toLowerCase();
      const website = (c.website || "").toLowerCase();
      return name.includes(q) || country.includes(q) || website.includes(q);
    });
  }, [companies, companySearch]);

  // Basit slug: company_name -> url slug
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

  function openCompanyStand(company) {
    // Şimdilik: /company/<slug> açıyoruz (sayfayı sonra kodlayacağız)
    const slug = toSlug(company.company_name) || company.user_id;
    navigate(`/company/${slug}`);
  }

  return (
    <div style={styles.page}>
      <div style={styles.headerRow}>
        <h1 style={styles.h1}>PI MODE</h1>

        <div style={styles.tabs}>
          <button
            onClick={() => setTab("products")}
            style={{ ...styles.tabBtn, ...(tab === "products" ? styles.tabActive : {}) }}
          >
            Products
          </button>
          <button
            onClick={() => setTab("companies")}
            style={{ ...styles.tabBtn, ...(tab === "companies" ? styles.tabActive : {}) }}
          >
            Companies
          </button>
        </div>
      </div>

      {tab === "products" ? (
        <div style={styles.card}>
          <h2 style={styles.h2}>Products (Showroom)</h2>
          <p style={styles.p}>
            Buraya senin mevcut ürün listeleme UI’ını geri koyacağız. Şimdilik Companies kısmını
            ayağa kaldırdık.
          </p>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button style={styles.primaryBtn} onClick={() => navigate("/pi/rfq/create")}>
              Create RFQ
            </button>
            <button style={styles.secondaryBtn} onClick={() => setTab("companies")}>
              Browse Companies
            </button>
          </div>
        </div>
      ) : (
        <div style={styles.card}>
          <div style={styles.companyTop}>
            <h2 style={styles.h2}>Companies (Verified Stands)</h2>

            <input
              value={companySearch}
              onChange={(e) => setCompanySearch(e.target.value)}
              placeholder="Search company / country / website..."
              style={styles.search}
            />
          </div>

          {loadingCompanies ? (
            <p style={styles.p}>Loading companies…</p>
          ) : filteredCompanies.length === 0 ? (
            <div style={styles.empty}>
              <p style={styles.p}>(Henüz approved şirket yok)</p>
              <button style={styles.secondaryBtn} onClick={() => navigate("/company/apply")}>
                Company Apply
              </button>
            </div>
          ) : (
            <div style={styles.grid}>
              {filteredCompanies.map((c) => (
                <div key={c.id} style={styles.companyCard}>
                  <div style={styles.companyHeader}>
                    <div>
                      <div style={styles.companyName}>{c.company_name || "Company"}</div>
                      <div style={styles.companyMeta}>
                        <span>{c.country || "—"}</span>
                        <span style={styles.dot}>•</span>
                        <span style={styles.badge}>Verified</span>
                      </div>
                    </div>
                  </div>

                  <div style={styles.companyBody}>
                    <div style={styles.line}>
                      <span style={styles.label}>Website:</span>{" "}
                      {c.website ? (
                        <a href={c.website} target="_blank" rel="noreferrer" style={styles.link}>
                          {c.website}
                        </a>
                      ) : (
                        <span style={styles.muted}>—</span>
                      )}
                    </div>

                    <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
                      <button style={styles.primaryBtn} onClick={() => openCompanyStand(c)}>
                        View Stand
                      </button>
                      <button style={styles.secondaryBtn} onClick={() => navigate("/pi/rfq/create")}>
                        Create RFQ
                      </button>
                    </div>
                  </div>

                  <div style={styles.companyFooter}>
                    <small style={styles.small}>
                      TradePiGloball is not a party to transactions. (Showroom only)
                    </small>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const styles = {
  page: {
    padding: 16,
    maxWidth: 980,
    margin: "0 auto",
  },
  headerRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 12,
  },
  h1: { margin: 0, fontSize: 22, letterSpacing: 1 },
  h2: { margin: "0 0 10px 0", fontSize: 18 },
  p: { margin: "0 0 14px 0", opacity: 0.85 },

  tabs: { display: "flex", gap: 8 },
  tabBtn: {
    border: "1px solid rgba(255,255,255,0.15)",
    background: "rgba(0,0,0,0.25)",
    padding: "8px 12px",
    borderRadius: 999,
    cursor: "pointer",
  },
  tabActive: {
    background: "rgba(120,70,255,0.35)",
    border: "1px solid rgba(160,120,255,0.55)",
  },

  card: {
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 16,
    padding: 16,
    background: "rgba(0,0,0,0.25)",
  },

  primaryBtn: {
    padding: "10px 14px",
    borderRadius: 12,
    border: "1px solid rgba(160,120,255,0.65)",
    background: "rgba(120,70,255,0.45)",
    cursor: "pointer",
    fontWeight: 600,
  },
  secondaryBtn: {
    padding: "10px 14px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.18)",
    background: "rgba(0,0,0,0.25)",
    cursor: "pointer",
  },

  companyTop: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    flexWrap: "wrap",
    marginBottom: 12,
  },
  search: {
    minWidth: 240,
    flex: 1,
    maxWidth: 420,
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.15)",
    background: "rgba(0,0,0,0.25)",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: 12,
  },

  companyCard: {
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 16,
    overflow: "hidden",
    background: "rgba(0,0,0,0.20)",
  },
  companyHeader: {
    padding: 14,
    borderBottom: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(120,70,255,0.10)",
  },
  companyName: { fontSize: 16, fontWeight: 800 },
  companyMeta: { display: "flex", alignItems: "center", gap: 8, opacity: 0.9, marginTop: 6 },
  dot: { opacity: 0.5 },
  badge: {
    fontSize: 12,
    padding: "2px 8px",
    borderRadius: 999,
    border: "1px solid rgba(160,120,255,0.55)",
  },

  companyBody: { padding: 14 },
  line: { opacity: 0.9, marginBottom: 6 },
  label: { opacity: 0.7 },
  link: { textDecoration: "underline" },
  muted: { opacity: 0.6 },

  companyFooter: {
    padding: 12,
    borderTop: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(0,0,0,0.15)",
  },
  small: { opacity: 0.7 },

  empty: { display: "flex", gap: 10, alignItems: "center", justifyContent: "space-between" },
};
