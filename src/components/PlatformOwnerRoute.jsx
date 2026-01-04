import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function PlatformOwnerRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    const checkOwner = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (!error && data?.role === "owner") {
        setIsOwner(true);
      }

      setLoading(false);
    };

    checkOwner();
  }, []);

  if (loading) return <div style={{ padding: 40 }}>Loading...</div>;
  if (!isOwner) return <Navigate to="/" replace />;

  return children;
}
