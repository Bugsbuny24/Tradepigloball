import { createClient } from "@supabase/supabase-js";
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { rfq_id, vote } = req.body;
  const curatorId = req.headers["x-user-id"];

  await supabase.from("curator_votes").insert({
    curator_id: curatorId,
    rfq_id,
    vote
  });

  res.json({ ok: true });
}
