import { supabaseUser, supabaseAdmin } from './_lib/supabase.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { packageId } = req.body || {}
  if (!packageId) return res.status(400).json({ error: 'Missing packageId' })

  const supaUser = supabaseUser(req)
  const { data: me } = await supaUser.auth.getUser()
  const userId = me?.user?.id
  if (!userId) return res.status(401).json({ error: 'Not authenticated' })

  const supaAdmin = supabaseAdmin()

  const { data: pack, error: perr } = await supaAdmin
    .from('credit_packages')
    .select('*')
    .eq('id', packageId)
    .eq('active', true)
    .single()

  if (perr) return res.status(400).json({ error: perr.message })

  const memo = `CREDIT:${userId}:${crypto.randomUUID()}`
  const idempotencyKey = crypto.randomUUID()

  const creditTotal = (pack.credit_amount || 0) + (pack.bonus_credit || 0)

  const { data: invoice, error: ierr } = await supaAdmin
    .from('credit_invoices')
    .insert([{
      user_id: userId,
      package_id: pack.id,
      status: 'pending',
      pi_amount: pack.pi_amount,
      credit_amount: creditTotal,
      memo,
      idempotency_key: idempotencyKey
    }])
    .select('id,status,pi_amount,credit_amount,memo,created_at')
    .single()

  if (ierr) return res.status(400).json({ error: ierr.message })

  res.json({
    ok: true,
    invoice,
    payTo: process.env.PI_RECEIVER_WALLET,
    amountPi: Number(pack.pi_amount),
    memo
  })
    }
