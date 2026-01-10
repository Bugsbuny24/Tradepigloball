import { supabaseServer } from './_lib/supabase.js'

export default async function handler(req, res) {
  const supabase = supabaseServer(req)

  const { data, error } = await supabase
    .from('rfqs')
    .select(`
      *,
      is_featured,
      featured_until
    `)
    .order('created_at', { ascending: false })

  if (error) return res.status(400).json({ error: error.message })
  res.json(data)
}
