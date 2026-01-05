import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export default function PlatformOwnerRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    const check = async () => {
      const { data } = await supabase.auth.getUser();
      setHasSession(!!data?.user);
      setLoading(false);
    };
    check();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (!hasSession) return <Navigate to="/login" replace />;

  return children;
}
