import { supabase } from "./supabaseClient";

export async function fetchProducts({ q = "", country = "", featuredOnly = false } = {}) {
  let query = supabase
    .from("products")
    .select("id,title,country,moq,image_url,company_id,is_featured,created_at")
    .order("is_featured", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(60);

  if (q) query = query.ilike("title", `%${q}%`);
  if (country) query = query.eq("country", country);
  if (featuredOnly) query = query.eq("is_featured", true);

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function fetchCompanies({ q = "", country = "", verifiedOnly = false } = {}) {
  let query = supabase
    .from("companies")
    .select("id,name,slug,country,industry,logo_url,banner_url,is_verified,created_at")
    .order("is_verified", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(60);

  if (q) query = query.ilike("name", `%${q}%`);
  if (country) query = query.eq("country", country);
  if (verifiedOnly) query = query.eq("is_verified", true);

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function fetchRfqs({ q = "", country = "", openOnly = true } = {}) {
  let query = supabase
    .from("rfqs")
    .select("id,title,country,quantity,deadline,status,created_at")
    .order("created_at", { ascending: false })
    .limit(60);

  if (q) query = query.ilike("title", `%${q}%`);
  if (country) query = query.eq("country", country);
  if (openOnly) query = query.eq("status", "open");

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
    }
