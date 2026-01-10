import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useNavigate } from "react-router-dom";

export default function DigitalNew() {
  const nav = useNavigate();
  const [title, setTitle] = useState("");
  const [pricePi, setPricePi] = useState(1);
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);

  async function createAndPublish() {
    setBusy(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Login required");

      // 1) create product draft
      const { data: product, error: pErr } = await supabase
        .from("digital_products")
        .insert({
          owner_id: user.id,
          title,
          price_pi: Number(pricePi),
          is_active: false,
        })
        .select("id")
        .single();

      if (pErr) throw pErr;
      if (!file) throw new Error("File required");

      const path = `${user.id}/${product.id}/${file.name}`;

      // 2) upload to private bucket (owner folder policy allows)
      const { error: upErr } = await supabase.storage
        .from("digital-products")
        .upload(path, file, { upsert: true });

      if (upErr) throw upErr;

      // 3) publish product
      const { error: pubErr } = await supabase
        .from("digital_products")
        .update({ file_path: path, is_active: true })
        .eq("id", product.id);

      if (pubErr) throw pubErr;

      nav(`/digital/${product.id}`);
    } catch (e) {
      alert(e.message ?? String(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ padding: 16 }}>
      <h2>New Digital Product</h2>

      <div>
        <input placeholder="Title" value={title} onChange={(e)=>setTitle(e.target.value)} />
      </div>

      <div style={{ marginTop: 8 }}>
        <input type="number" value={pricePi} onChange={(e)=>setPricePi(e.target.value)} />
        <span style={{ marginLeft: 8 }}>PI</span>
      </div>

      <div style={{ marginTop: 8 }}>
        <input type="file" onChange={(e)=>setFile(e.target.files?.[0] ?? null)} />
      </div>

      <button disabled={busy} onClick={createAndPublish} style={{ marginTop: 12 }}>
        {busy ? "Working..." : "Publish"}
      </button>
    </div>
  );
}
