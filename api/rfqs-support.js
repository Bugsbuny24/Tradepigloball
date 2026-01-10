import { supabaseServer } from './_lib/supabase.js'
import crypto from 'crypto'

export default async function handler(req, res) {
  if (req.method !== 'POST')
    return res.status(405).json({ error: 'Method not allowed' })

  const { rfqId } = req.body
  if (!rfqId) return res.status(400).json({ error: 'Missing rfqId' })

  const supabase = supabaseServer(req)

  const { data, error } = await supabase.rpc('support_rfq', {
    p_rfq_id: rfqId,
    p_qty: 1,
    p_idempotency_key: crypto.randomUUID(),
  })

  if (error) return res.status(400).json({ error: error.message })
  res.json(data)
}
