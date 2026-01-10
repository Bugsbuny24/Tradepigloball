import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

export default function CreatorProfile() {
  const { id } = useParams();
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch(`/api/creator-get?user_id=${id}`)
      .then(r=>r.json())
      .then(setData);
  }, [id]);

  if (!data) return <div>Yükleniyor…</div>;

  return (
    <div style={{ padding: 20 }}>
      <img src={data.profile.avatar_url} width="80" />
      <h2>{data.profile.display_name}</h2>
      <p>{data.profile.bio}</p>

      <h4>Badges</h4>
      <div>
        {data.badges.map(b=>(
          <span key={b.badge} style={{ marginRight: 8 }}>
            🏅 {b.badge}
          </span>
        ))}
      </div>

      <button onClick={async()=>{
        await fetch("/api/badge-apply",{
          method:"POST",
          headers:{ "Content-Type":"application/json" },
          body: JSON.stringify({ badge:"community_pick" })
        });
        alert("Aday oldun 🏅");
        window.location.reload();
      }}>
        Badge’e Aday Ol (20 Credit)
      </button>

      <h4>RFQ’lar</h4>
      <ul>
        {data.rfqs.map(r=>(
          <li key={r.id}>
            <Link to={`/rfq/${r.id}`}>{r.title}</Link> — {r.status}
          </li>
        ))}
      </ul>
    </div>
  );
}
