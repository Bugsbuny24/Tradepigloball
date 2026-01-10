import { supabaseServer } from './_lib/supabase.js'

export default async function handler(req, res) {
  const supabase = supabaseServer(req)

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  // wallet yoksa DB trigger zaten oluşturuyor
  return res.json({ ok: true, user_id: user.id })
}
