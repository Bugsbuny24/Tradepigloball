import fetch from "node-fetch";

export default async function handler(req, res) {
  const { title, body, head } = req.body;

  const r = await fetch(
    `https://api.github.com/repos/${process.env.GITHUB_OWNER}/${process.env.GITHUB_REPO}/pulls`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        title,
        body,
        head,
        base: "main"
      })
    }
  );

  res.json(await r.json());
}
