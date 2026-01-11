import fetch from "node-fetch";

export default async function handler(req, res) {
  const { deploymentId } = req.body;

  const r = await fetch(
    `https://api.vercel.com/v13/deployments/${deploymentId}/promote`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.VERCEL_TOKEN}`
      }
    }
  );

  res.json(await r.json());
}
