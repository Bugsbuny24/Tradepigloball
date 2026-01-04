import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function OwnerPanel() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [msg, setMsg] = useState("");

  // TEK useEffect yeterli
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setMsg("");

      const { data, error } = await supabase
        .from("company_profiles")
        .select("user_id, company_name, status, is_verified, created_at")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Supabase error:", error);
        setMsg(error.message);
        setItems([]);
      } else {
        setItems(data || []);
      }
    } catch (err) {
      console.error("Load error:", err);
      setMsg("Beklenmeyen bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  const approve = async (user_id) => {
    setMsg("");
    
    const { data: auth } = await supabase.auth.getUser();
    const ownerId = auth?.user?.id;

    const { error: e1 } = await supabase
      .from("company_profiles")
      .update({
        status: "approved",
        is_verified: true,
        owner_id: ownerId,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user_id);

    const { error: e2 } = await supabase
      .from("profiles")
      .update({ user_type: "company" })
      .eq("id", user_id);

    if (e1 || e2) {
      setMsg((e1 || e2).message);
    }
    
    await loadData(); // Reload data
  };

  const reject = async (user_id) => {
    setMsg("");
    
    const { data: auth } = await supabase.auth.getUser();
    const ownerId = auth?.user?.id;

    const { error } = await supabase
      .from("company_profiles")
      .update({
        status: "rejected",
        is_verified: false,
        owner_id: ownerId,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user_id);

    if (error) {
      setMsg(error.message);
    }
    
    await loadData(); // Reload data
  };

  if (loading) {
    return (
      <div style={{ padding: 24, color: "#fff", textAlign: "center" }}>
        <h2>Owner Panel</h2>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: 24, color: "#fff" }}>
      <h2>Owner Panel</h2>
      
      {msg && (
        <div style={{ color: "#ff0000", marginBottom: 12 }}>
          {msg}
        </div>
      )}

      {items.length === 0 ? (
        <p>No pending company applications.</p>
      ) : (
        <div style={{ display: "grid", gap: 10 }}>
          {items.map((x) => (
            <div
              key={x.user_id}
              style={{
                border: "1px solid rgba(255,255,255,.15)",
                borderRadius: 10,
                padding: 12,
              }}
            >
              <div>
                <b>{x.company_name}</b>
              </div>
              <div style={{ opacity: 0.9 }}>
                User ID: {x.user_id}
              </div>
              <div>
                Status: {x.status} | Verified: {String(x.is_verified)}
              </div>
              <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
                <button
                  onClick={() => approve(x.user_id)}
                  style={{ padding: "8px 16px" }}
                >
                  Approve
                </button>
                <button
                  onClick={() => reject(x.user_id)}
                  style={{ padding: "8px 16px" }}
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
