import { supabase } from "./supabase";

export async function getAuthDebug() {
  const out = {
    hasSession: false,
    sessionUserId: null,
    userId: null,
    email: null,
    error: null,
  };

  try {
    const { data: sessionData, error: sessionErr } = await supabase.auth.getSession();
    if (sessionErr) throw sessionErr;

    out.hasSession = !!sessionData?.session;
    out.sessionUserId = sessionData?.session?.user?.id ?? null;

    const { data: userData, error: userErr } = await supabase.auth.getUser();
    if (userErr) throw userErr;

    out.userId = userData?.user?.id ?? null;
    out.email = userData?.user?.email ?? null;

    return out;
  } catch (e) {
    out.error = e?.message || String(e);
    return out;
  }
}
