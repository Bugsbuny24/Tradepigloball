import { useEffect, useState } from "react";

export default function CuratorPanel() {
  const [rfqs, setRfqs] = useState([]);

  useEffect(() => {
    fetch("/api/curator-feed")
      .then(r=>r.json())
      .then(setRfqs);
  }, []);

  const vote = async (rfq_id, v) => {
    await fetch("/api/curator-vote",{
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body: JSON.stringify({ rfq_id, vote:v })
    });
    alert("Oyun alındı");
  };

  return (
    <div style={{ padding:20 }}>
      <h1>Curator Panel</h1>
      {rfqs.map(r=>(
        <div key={r.id} style={{ border:"1px solid #ddd", marginBottom:10, padding:10 }}>
          <h4>{r.title}</h4>
          <p>{r.current_credit} / {r.min_credit}</p>
          <button onClick={()=>vote(r.id,"approve")}>👍 Onayla</button>
          <button onClick={()=>vote(r.id,"reject")}>👎 Reddet</button>
        </div>
      ))}
    </div>
  );
}
