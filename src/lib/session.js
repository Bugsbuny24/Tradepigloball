import { supabase } from "./supabaseClient";

// Buyer mı? -> buyers tablosunda id=auth.uid var mı?
export async function getBuyerProfile(uid) {
  const { data, error } = await supabase
    .from("buyers")
    .select("id,email,full_name,country,created_at")
    .eq("id", uid)
    .maybeSingle();

  if (error) throw error;
  return data; // null olabilir
}

// Seller mı? -> edge function get-my-company
export async function getMyCompany() {
  const { data, error } = await supabase.functions.invoke("get-my-company");
  if (error) throw error;
  return data; // {ok, has_company, company, membership}
}

export async function signOut() {
  await supabase.auth.signOut();
}
