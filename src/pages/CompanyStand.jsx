import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export default function CompanyStand() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [company, setCompany] = useState(null);
  const [products, setProducts] = useState([]);
  const [errorMsg, setErrorMsg] = useState("");

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

  useEffect(() => {
    let alive = true;

    async function run() {
      setLoading(true);
      setErrorMsg("");
      setCompany(null);
      setProducts([]);

      try {
        // 1) Approved şirketi çek (RLS: anon select approved olmalı)
        const { data, error } = await supabase
          .from("company_applications")
          .select("id, user_id, company_name, full_name, country, website, status, created_at")
          .eq("status", "approved")
          .order("created_at", { ascending: false });

        if (!alive) return;

        if (error) {
          console.error("company fetch error:", error);
          setErrorMsg(error.message || "Company data could not be loaded.");
          return;
        }

        const list = data || [];
        const found =
          list.find((c) => toSlug(c.company_name) === slug) ||
          list.find((c) => c.user_id === slug);

        if (!found) {
          setErrorMsg("Company not found (or not approved).");
          return;
        }

        setCompany(found);

        // 2) ürünleri çek (varsa)
        const { data: prodData, error: prodErr } = await supabase
          .from("products")
          .select("id, title, description, price, currency, created_at")
          .eq("user_id", found.user_id)
          .order("created_at", { ascending: false });

        if (!alive) return;

        if (prodErr) {
          console.warn("products fetch warning:", prodErr);
          setProducts([]);
        } else {
          setProducts(prodData || []);
        }
      } finally {
        if (alive) setLoading(false);
      }
    }

    run();
    return () => {
      alive = false;
    };
  }, [slug]); // ✅ SADECE slug

  const websiteHost = useMemo(() => {
    if (!company?.website) return "";
    try {
      const u = new URL(company.website.startsWith("http") ? company.website : `https://${company.website}`);
      return u.host;
    } catch {
      return company.website;
    }
  }, [company]);

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>Loading stand…</div>
      </div>
    );
  }

  if (!company) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <h2 style={styles.h2}>Stand</h2>
          <p style={styles.p}>{errorMsg || "Not found."}</p>
          <button style={styles.secondaryBtn} onClick={() => navigate("/pi/products")}>
            Back to Companies
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.hero}>
        <div>
          <div style={styles.badge}>Verified Company Stand</div>
          <h1 style={styles.h1}>{company.company_name || "Company"}</h1>
          <div style={styles.meta}>
            <span>{company.country || "—"}</span>
            <span style={styles.dot}>•</span>
            <span>Owner: {company.full_name || "—"}</span>
            {websiteHost ? (
              <>
                <span style={styles.dot}>•</span>
                <a
                  href={company.website.startsWith("http") ? company.website : `https://${company.website}`}
                  target="_blank"
                  rel="noreferrer"
                  style={styles.link}
                >
                  {websiteHost}
                </a>
              </>
            ) : null}
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 12 }}>
            <button style={styles.primaryBtn} onClick={() => navigate("/pi/rfq/create")}>
              Create RFQ
            </button>
            <button style={styles.secondaryBtn} onClick={() => navigate("/pi/products")}>
              Back
            </button>
          </div>
        </div>
      </div>

      <div style={styles.card}>
        <h2 style={styles.h2}>Products</h2>
        <p style={styles.p}>
          Showroom only. TradePiGloball is not a party to payments, delivery, refunds, or disputes.
        </p>

        {products.length === 0 ? (
          <div style={styles.empty}>
            <p style={styles.p}>(No products yet)</p>
            <button style={styles.secondaryBtn} onClick={() => navigate("/pi/rfq/create")}>
              Create RFQ anyway
            </button>
          </div>
        ) : (
          <div style={styles.grid}>
            {products.map((p) => (
              <div key={p.id} style={styles.productCard}>
                <div style={styles.productTitle}>{p.title || "Product"}</div>
                {p.description ? <div style={styles.productDesc}>{p.description}</div> : null}

                <div style={styles.productFooter}>
                  <span style={styles.muted}>
                    {p.price ? `${p.price} ${p.currency || ""}` : "Price: RFQ"}
                  </span>
                  <button style={styles.smallBtn} onClick={() => navigate("/pi/rfq/create")}>
                    RFQ
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: { padding: 16, maxWidth: 980, margin: "0 auto" },
  hero: {
    borderRadius: 18,
    padding: 18,
    marginBottom: 12,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(120,70,255,0.12)",
  },
  badge: {
    display: "inline-block",
    fontSize: 12,
    padding: "4px 10px",
    borderRadius: 999,
    border: "1px solid rgba(160,120,255,0.55)",
    marginBottom: 10,
  },
  h1: { margin: "0 0 8px 0", fontSize: 22, fontWeight: 900 },
  h2: { margin: "0 0 10px 0", fontSize: 18 },
  meta: { display: "flex", gap: 8, flexWrap: "wrap", opacity: 0.9, alignItems: "center" },
  dot: { opacity: 0.6 },
  link: { textDecoration: "underline" },
  p: { margin: "0 0 14px 0", opacity: 0.85 },
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
    fontWeight: 700,
  },
  secondaryBtn: {
    padding: "10px 14px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.18)",
    background: "rgba(0,0,0,0.25)",
    cursor: "pointer",
  },
  empty: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 12 },
  productCard: {
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 14,
    padding: 14,
    background: "rgba(0,0,0,0.18)",
  },
  productTitle: { fontWeight: 900, marginBottom: 6 },
  productDesc: { opacity: 0.85, marginBottom: 10 },
  productFooter: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 },
  muted: { opacity: 0.7 },
  smallBtn: {
    padding: "8px 10px",
    borderRadius: 10,
    border: "1px solid rgba(255,255,255,0.18)",
    background: "rgba(0,0,0,0.25)",
    cursor: "pointer",
    fontWeight: 700,
  },
};
