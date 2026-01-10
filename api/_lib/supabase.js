import { createClient } from '@supabase/supabase-js'

export const supabaseUser = (req) => {
  const token = req.headers.authorization?.replace('Bearer ', '')
  return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY, {
    auth: { persistSession: false },
    global: { headers: token ? { Authorization: `Bearer ${token}` } : {} }
  })
}
