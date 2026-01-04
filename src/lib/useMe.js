import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

export default function useMe() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);

  async function loadMe() {
    setLoading(true);

    const { data: auth } = await supabase.auth.getUser();
    const u = auth?.user ?? null;
    setUser(u);

    if (!u) {
      setProfile(null);
      setLoading(false);
      return;
    }

    const { data: p, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", u.id)
      .single();

    if (!error) setProfile(p);
    else setProfile(null);

    setLoading(false);
  }

  useEffect(() => {
    loadMe();

    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      loadMe();
    });

    return () => sub?.subscription?.unsubscribe?.();
  }, []);

  return { loading, user, profile, reload: loadMe };
}
