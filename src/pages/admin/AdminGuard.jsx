import { Navigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";

export default function AdminGuard({ children }) {
  const [ok, setOk] = useState(null);

  useEffect(() => {
    supabase
      .from("app_admins")
      .select("user_id")
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        setOk(!!data);
      });
  }, []);

  if (ok === null) return null;
  if (!ok) return <Navigate to="/" replace />;

  return children;
}
