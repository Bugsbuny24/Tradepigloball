import { supabaseUser } from './_lib/supabase.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { mode, title, description, productType, minCredit, tags, assetUrls } = req.body || {}
  if (!title) return res.status(400).json({ error: 'Missing title' })

  const supabase = supabaseUser(req)

  const { data, error } = await supabase.rpc('create_rfq', {
    p_mode: mode || 'rfq',
    p_title: title,
    p_description: description || '',
    p_product_type: productType || null,
    p_min_credit: Number.isFinite(minCredit) ? minCredit : 0,
    p_tags: Array.isArray(tags) ? tags : [],
    p_asset_urls: Array.isArray(assetUrls) ? assetUrls : [],
    p_idempotency_key: crypto.randomUUID()
  })

  if (error) return res.status(400).json({ error: error.message })
  res.json(data)
}
