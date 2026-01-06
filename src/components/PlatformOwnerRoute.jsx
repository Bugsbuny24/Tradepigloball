import { useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

function parseCSV(str) {
  return (str || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export default function PlatformOwnerRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const [hasSession, setHasSession] = useState(false);
  const [isOwner, setIsOwner] = useState(false);

  const ownerIds = useMemo(() => parseCSV(import.meta.env.VITE_OWNER_IDS), []);
  const ownerEmails = useMemo(() => parseCSV(import.meta.env.VITE_OWNER_EMAILS), []);

  useEffect(() => {
    const check = async () => {
      const { data, error } = await supabase.auth.getUser();
      const user = data?.user;

      setHasSession(!!user && !error);

      if (user) {
        const ok =
          (ownerIds.length > 0 && ownerIds.includes(user.id)) ||
          (ownerEmails.length > 0 && ownerEmails.includes(user.email || ""));
        setIsOwner(ok);
      } else {
        setIsOwner(false);
      }

      setLoading(false);
    };

    check();
  }, [ownerIds, ownerEmails]);

  if (loading) return <div style={{ padding: 20 }}>Loading...</div>;
  if (!hasSession) return <Navigate to="/login" replace />;
  if (!isOwner) return <Navigate to="/" replace />;

  return children;
}
