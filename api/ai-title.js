import { createClient } from "@supabase/supabase-js";
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  const { text } = req.body;

  await supabase.rpc("burn_credit", {
    p_amount: 5,
    p_reason: "ai_title"
  });

  // MVP: basit rewrite (sonra GPT)
  const improved = text.length > 50
    ? text.slice(0, 50)
    : `${text} (Community Pick?)`;

  res.json({ result: improved });
}
