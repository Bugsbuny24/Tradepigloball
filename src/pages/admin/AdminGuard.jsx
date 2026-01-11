import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { isAdmin } from "@/lib/adminCheck";
import { useNavigate } from "react-router-dom";

export default function AdminGuard({ children }) {
  const nav = useNavigate();
  const [ok, setOk] = useState(false);

  useEffect(() => {
    const run = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data?.user) return nav("/login");

      const allowed = await isAdmin(data.user.id);
      if (!allowed) return nav("/");

      setOk(true);
    };
    run();
  }, []);

  if (!ok) return null;
  return children;
}
