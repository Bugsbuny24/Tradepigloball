import { supabaseUser, supabaseAdmin } from './_lib/supabase.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { invoiceId, piTxId } = req.body || {}
  if (!invoiceId || !piTxId) return res.status(400).json({ error: 'Missing invoiceId or piTxId' })

  const supaUser = supabaseUser(req)
  const { data: me } = await supaUser.auth.getUser()
  const userId = me?.user?.id
  if (!userId) return res.status(401).json({ error: 'Not authenticated' })

  const supaAdmin = supabaseAdmin()

  const { data: invoice, error: ierr } = await supaAdmin
    .from('credit_invoices')
    .select('*')
    .eq('id', invoiceId)
    .eq('user_id', userId)
    .single()

  if (ierr) return res.status(400).json({ error: ierr.message })
  if (invoice.status === 'confirmed') return res.json({ ok: true, already: true })

  // TODO: Burada Pi tx doğrulaması yapılmalı (amount, payTo, memo eşleşmesi)
  // Şimdilik manuel doğrulamaya uygun akış:
  // - ileride Pi API doğrulaması ekleyeceğiz.

  // invoice'ı confirmed yap
  const { error: uerr } = await supaAdmin
    .from('credit_invoices')
    .update({ status: 'confirmed', pi_tx_id: piTxId, confirmed_at: new Date().toISOString() })
    .eq('id', invoiceId)

  if (uerr) return res.status(400).json({ error: uerr.message })

  // mint_credit (service_role ile)
  const mintKey = `mint_${invoiceId}`
  const { data: mintRes, error: merr } = await supaAdmin.rpc('mint_credit', {
    p_user_id: userId,
    p_amount: invoice.credit_amount,
    p_reason: 'credit_purchase',
    p_idempotency_key: mintKey
  })

  if (merr) return res.status(400).json({ error: merr.message })

  res.json({ ok: true, minted: invoice.credit_amount, mintRes })
}
