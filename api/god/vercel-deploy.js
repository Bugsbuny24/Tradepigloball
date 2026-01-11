import fetch from "node-fetch";

export default async function handler(req, res) {
  const r = await fetch("https://api.vercel.com/v13/deployments", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.VERCEL_TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      name: "tradepigloball",
      project: process.env.VERCEL_PROJECT_ID,
      target: "production"
    })
  });

  res.json(await r.json());
}
