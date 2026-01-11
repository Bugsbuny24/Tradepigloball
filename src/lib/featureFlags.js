import { supabase } from "./supabase";

export async function getFeature(key) {
  const { data } = await supabase
    .from("feature_flags")
    .select("*")
    .eq("key", key)
    .single();

  return data;
}
