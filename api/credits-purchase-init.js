export default function handler(req, res) {
  const { packageId } = req.body
  if (!packageId) return res.status(400).json({ error: 'Missing packageId' })

  // burada Pi network integration olacak
  res.json({ ok: true, packageId })
}
