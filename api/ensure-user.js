import { supabaseUser } from './_lib/supabase'

export default async function handler(req, res) {
  const supabase = supabaseUser(req)

  const { data, error } = await supabase.rpc('ensure_user')

  if (error) return res.status(400).json({ error: error.message })
  res.json(data)
}
