import { supabaseServer } from './_lib/supabase.js'

export default async function handler(req, res) {
  const supabase = supabaseServer(req)
  const { amount } = req.body

  if (!amount) return res.status(400).json({ error: 'Missing amount' })

  const { error } = await supabase.rpc('mint_credit', {
    p_amount: amount,
    p_reason: 'pi_topup',
  })

  if (error) return res.status(400).json({ error: error.message })
  res.json({ ok: true })
}
