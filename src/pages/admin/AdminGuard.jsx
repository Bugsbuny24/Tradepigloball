import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Navigate } from "react-router-dom";

export default function AdminGuard({ children }) {
  const [ok, setOk] = useState(null);

  useEffect(() => {
    const run = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data?.user) return setOk(false);

      const { data: admin } = await supabase
        .from("admins")
        .select("id")
        .eq("user_id", data.user.id)
        .single();

      setOk(!!admin);
    };
    run();
  }, []);

  if (ok === null) return null;
  if (!ok) return <Navigate to="/login" replace />;

  return children;
}
