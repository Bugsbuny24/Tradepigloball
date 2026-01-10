import { supabaseUser } from '../_lib/supabase'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { rfqId } = req.body
  const supabase = supabaseUser(req)

  const { data, error } = await supabase.rpc('support_rfq', {
    p_rfq_id: rfqId,
    p_amount: 5,
    p_idempotency_key: crypto.randomUUID()
  })

  if (error) return res.status(400).json({ error: error.message })
  res.json(data)
}
