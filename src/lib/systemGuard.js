export async function checkSystem() {
  const { data } = await supabase
    .from("system_flags")
    .select("*")
    .eq("key", "GLOBAL_FREEZE")
    .single();

  if (data.enabled) {
    throw new Error("System temporarily paused");
  }
}
