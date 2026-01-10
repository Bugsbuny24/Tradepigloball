export default async function handler(req, res) {
  try {
    const token = process.env.PRINTIFY_TOKEN
    if (!token) return res.status(500).json({ error: "Missing PRINTIFY_TOKEN" })

    const r = await fetch("https://api.printify.com/v1/shops.json", {
      headers: { Authorization: `Bearer ${token}` },
    })

    const data = await r.json()
    return res.status(r.status).json(data)
  } catch (e) {
    return res.status(500).json({ error: e.message || "Server error" })
  }
}
