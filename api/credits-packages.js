import { supabaseUser } from './_lib/supabase.js'

export default async function handler(req, res) {
  const supabase = supabaseUser(req)
  const { data, error } = await supabase
    .from('credit_packages')
    .select('id,title,pi_amount,credit_amount,bonus_credit')
    .order('pi_amount', { ascending: true })

  if (error) return res.status(400).json({ error: error.message })
  res.json({ items: data || [] })
}
