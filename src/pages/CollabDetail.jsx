import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function CollabDetail() {
  const { id } = useParams();
  const [data, setData] = useState(null);

  useEffect(()=>{
    fetch(`/api/collab-get?collab_id=${id}`)
      .then(r=>r.json())
      .then(setData);
  },[id]);

  if (!data) return <div>Yükleniyor…</div>;

  return (
    <div style={{ padding:20 }}>
      <h2>Collab</h2>
      <p>Status: {data.collab.status}</p>

      <h4>Members</h4>
      <ul>
        {data.members.map(m=>(
          <li key={m.user_id}>{m.user_id} – {m.role}</li>
        ))}
      </ul>
    </div>
  );
}
