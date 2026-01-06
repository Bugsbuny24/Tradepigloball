import { useEffect, useMemo, useState } from "react";

import ShowroomTabs from "../components/showroom/ShowroomTabs";
import ShowroomTopbar from "../components/showroom/ShowroomTopbar";
import FiltersModal from "../components/showroom/FiltersModal";

import ProductCard from "../components/showroom/cards/ProductCard";
import CompanyCard from "../components/showroom/cards/CompanyCard";
import RfqCard from "../components/showroom/cards/RfqCard";

import { fetchProducts, fetchCompanies, fetchRfqs } from "../lib/showroomApi";

export default function PiProducts() {
  const [tab, setTab] = useState("products"); // products | companies | rfqs
  const [q, setQ] = useState("");
  const [filters, setFilters] = useState({
    country: "",
    featuredOnly: false,
    verifiedOnly: false,
    openOnly: true,
  });

  const [openFilters, setOpenFilters] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const [products, setProducts] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [rfqs, setRfqs] = useState([]);

  // küçük debounce
  const debouncedQ = useDebounce(q, 250);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      setLoading(true);
      setErr("");
      try {
        if (tab === "products") {
          const data = await fetchProducts({
            q: debouncedQ,
            country: filters.country,
            featuredOnly: filters.featuredOnly,
          });
          if (!cancelled) setProducts(data);
        } else if (tab === "companies") {
          const data = await fetchCompanies({
            q: debouncedQ,
            country: filters.country,
            verifiedOnly: filters.verifiedOnly,
          });
          if (!cancelled) setCompanies(data);
        } else {
          const data = await fetchRfqs({
            q: debouncedQ,
            country: filters.country,
            openOnly: filters.openOnly,
          });
          if (!cancelled) setRfqs(data);
        }
      } catch (e) {
        if (!cancelled) setErr(e.message || "Load error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [tab, debouncedQ, filters.country, filters.featuredOnly, filters.verifiedOnly, filters.openOnly]);

  const itemsCount = useMemo(() => {
    if (tab === "products") return products.length;
    if (tab === "companies") return companies.length;
    return rfqs.length;
  }, [tab, products.length, companies.length, rfqs.length]);

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <ShowroomTabs tab={tab} setTab={setTab} />
        <div style={{ height: 10 }} />
        <ShowroomTopbar q={q} setQ={setQ} onOpenFilters={() => setOpenFilters(true)} />
        <div style={styles.sub}>
          <span style={{ opacity: 0.85 }}>{itemsCount} results</span>
          <span style={{ opacity: 0.6 }}>
            • No payments on platform • RFQ/Contact only
          </span>
        </div>
      </div>

      <FiltersModal
        open={openFilters}
        onClose={() => setOpenFilters(false)}
        filters={filters}
        setFilters={setFilters}
        tab={tab}
      />

      {err && <div style={styles.err}>{err}</div>}

      {loading ? (
        <div style={styles.loading}>Loading...</div>
      ) : (
        <div style={styles.grid}>
          {tab === "products" &&
            products.map((p) => <ProductCard key={p.id} p={p} />)}

          {tab === "companies" &&
            companies.map((c) => <CompanyCard key={c.id} c={c} />)}

          {tab === "rfqs" &&
            rfqs.map((r) => <RfqCard key={r.id} r={r} />)}
        </div>
      )}
    </div>
  );
}

function useDebounce(value, delay = 250) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

const styles = {
  page: {
    minHeight: "100vh",
    padding: 16,
    color: "white",
    background:
      "radial-gradient(800px 500px at 20% 10%, rgba(160,80,255,0.25), transparent 60%), radial-gradient(700px 500px at 80% 20%, rgba(80,160,255,0.18), transparent 60%), #060612",
  },
  header: { maxWidth: 1100, margin: "0 auto" },
  sub: { marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" },
  err: {
    maxWidth: 1100,
    margin: "14px auto 0",
    padding: 12,
    borderRadius: 14,
    border: "1px solid rgba(255,80,80,0.35)",
    background: "rgba(255,80,80,0.12)",
  },
  loading: { maxWidth: 1100, margin: "18px auto 0", opacity: 0.85 },
  grid: {
    maxWidth: 1100,
    margin: "18px auto 0",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: 14,
  },
};
