export default async function handler(req, res) {
  const r = await fetch("https://api.printify.com/v1/shops.json", {
    headers: {
      Authorization: `Bearer ${process.env.PRINTIFY_API_KEY}`,
    },
  })

  const data = await r.json()
  res.status(200).json(data)
}
