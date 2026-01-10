import { supabaseUser } from './_lib/supabase'

export default async function handler(req, res) {
  const supabase = supabaseUser(req)

  const { data, error } = await supabase
    .from('credit_wallets')
    .select('balance')
    .single()

  if (error) return res.status(400).json({ error: error.message })
  res.json(data)
}
