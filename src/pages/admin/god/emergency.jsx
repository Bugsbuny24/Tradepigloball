import { supabase } from "@/lib/supabase";

async function toggle(key, enabled) {
  await supabase
    .from("system_flags")
    .update({ enabled })
    .eq("key", key);
}

export default function Emergency() {
  return (
    <>
      <h2 style={{color:"red"}}>🚨 EMERGENCY</h2>

      <button onClick={()=>toggle("GLOBAL_FREEZE", true)}>
        ⛔ FREEZE PLATFORM
      </button>

      <button onClick={()=>toggle("GLOBAL_FREEZE", false)}>
        ▶ RESUME
      </button>
    </>
  );
}
