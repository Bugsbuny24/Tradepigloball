export default function handler(req, res) {
  res.json([
    { id: 'starter', pi: 10, credit: 100 },
    { id: 'creator', pi: 50, credit: 600 },
    { id: 'pro', pi: 100, credit: 1300 },
    { id: 'boost', pi: 200, credit: 3000 },
  ])
}
