import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

export default function useMe() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);

      const { data: session } = await supabase.auth.getSession();
      const authUser = session?.session?.user ?? null;

      if (!authUser) {
        if (mounted) {
          setUser(null);
          setProfile(null);
          setLoading(false);
        }
        return;
      }

      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", authUser.id)
        .single();

      if (!mounted) return;

      setUser(authUser);
      setProfile(profileData);
      setLoading(false);
    }

    load();

    const { data: sub } = supabase.auth.onAuthStateChange(load);

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const role = profile?.role ?? "guest";

  return {
    loading,
    user,
    profile,
    role,
    isOwner: role === "owner",
    isCompany: role === "company",
    isBuyer: role === "buyer",
    isAuthed: !!user,
  };
}
