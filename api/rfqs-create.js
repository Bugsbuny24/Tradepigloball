import { supabaseServer } from './_lib/supabase.js'
import crypto from 'crypto'

export default async function handler(req, res) {
  if (req.method !== 'POST')
    return res.status(405).json({ error: 'Method not allowed' })

  const supabase = supabaseServer(req)
  const { title, description, product_type, min_credit } = req.body

  const { data, error } = await supabase.rpc('create_rfq', {
    p_title: title,
    p_description: description || '',
    p_product_type: product_type || null,
    p_min_credit: min_credit || 0,
    p_deadline: null,
    p_tags: [],
    p_idempotency_key: crypto.randomUUID(),
  })

  if (error) return res.status(400).json({ error: error.message })
  res.json(data)
}
