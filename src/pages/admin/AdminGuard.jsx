import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";

export default function AdminGuard({ children }) {
  const { user, loading } = useAuth();
  const [checking, setChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!user) {
      setChecking(false);
      return;
    }

    const checkAdmin = async () => {
      const { data, error } = await supabase
        .from("app_admins")
        .select("user_id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (data) {setIsAdmin(true);
      }
      

      setChecking(false);
    };

    checkAdmin();
  }, [user]);

  if (loading || checking) {
    return <div style={{ padding: 40 }}>Admin panel yükleniyor… 👑</div>;
  }

  if (!user || !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
}
