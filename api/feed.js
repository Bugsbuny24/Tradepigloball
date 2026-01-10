import { supabaseUser } from './_lib/supabase.js'

export default async function handler(req, res) {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`)
    const mode = url.searchParams.get('mode') || null
    const sort = url.searchParams.get('sort') || 'new' // new | trend
    const cursor = url.searchParams.get('cursor') // created_at iso
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '20', 10), 50)

    const supabase = supabaseUser(req)

    let q = supabase
      .from('rfqs')
      .select('id, creator_id, mode, status, title, description, product_type, min_credit, current_credit, tags, is_trending, is_featured, created_at', { count: 'exact' })
      .neq('status', 'closed')

    if (mode) q = q.eq('mode', mode)
    if (cursor) q = q.lt('created_at', cursor)

    if (sort === 'trend') {
      q = q.order('is_trending', { ascending: false }).order('current_credit', { ascending: false }).order('created_at', { ascending: false })
    } else {
      q = q.order('created_at', { ascending: false })
    }

    q = q.limit(limit)

    const { data, error } = await q
    if (error) return res.status(400).json({ error: error.message })

    const nextCursor = data?.length ? data[data.length - 1].created_at : null
    return res.status(200).json({ items: data || [], nextCursor })
  } catch (e) {
    return res.status(500).json({ error: e.message || 'Server error' })
  }
}
