import { supabase } from "./supabaseClient";

export async function getAuthDebug() {
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error) return { userId: null, email: null, error: error.message };
    const user = data?.user || null;
    return { userId: user?.id || null, email: user?.email || null, error: null };
  } catch (e) {
    return { userId: null, email: null, error: e?.message || "debug error" };
  }
}
