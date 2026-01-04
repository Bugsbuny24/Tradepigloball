import { useEffect, useState } from "react";
import { supabase } from "./supabase";

export function useMe() {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!mounted) return;
      setSession(session);

      if (!session?.user?.id) {
        setProfile(null);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("id, role, full_name")
        .eq("id", session.user.id)
        .single();

      if (!mounted) return;
      if (error) {
        console.error(error);
        setProfile(null);
      } else {
        setProfile(data);
      }
      setLoading(false);
    }

    load();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      // reload profile after login/logout
      load();
    });

    return () => {
      mounted = false;
      sub?.subscription?.unsubscribe?.();
    };
  }, []);

  return { loading, session, profile };
}
