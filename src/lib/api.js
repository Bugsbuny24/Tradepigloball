export async function fetchPrintifyProducts() {
  const r = await fetch("/api/printify/products");
  if (!r.ok) throw new Error("Products fetch failed");
  return r.json();
}
