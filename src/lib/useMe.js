import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

export default function useMe() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await supabase.auth.getUser();
        const u = data?.user || null;
        setUser(u);

        if (!u) {
          setProfile(null);
          return;
        }

        const { data: p } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", u.id)
          .single();

        setProfile(p || null);
      } catch (e) {
        console.error(e);
        setProfile(null);
      } finally {
        setLoading(false); // 🔴 KRİTİK
      }
    };

    load();
  }, []);

  return { loading, user, profile };
}
