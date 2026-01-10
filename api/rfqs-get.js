import { supabaseUser } from './_lib/supabase.js'

export default async function handler(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`)
  const id = url.searchParams.get('id')
  if (!id) return res.status(400).json({ error: 'Missing id' })

  const supabase = supabaseUser(req)

  const { data: rfq, error: rerr } = await supabase
    .from('rfqs')
    .select('*')
    .eq('id', id)
    .single()

  if (rerr) return res.status(404).json({ error: rerr.message })

  const { data: assets } = await supabase
    .from('rfq_assets')
    .select('asset_url, asset_type, created_at')
    .eq('rfq_id', id)
    .order('created_at', { ascending: false })

  res.json({ rfq, assets: assets || [] })
}
