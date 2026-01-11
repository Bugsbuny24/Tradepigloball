import fetch from "node-fetch";

export default async function handler(req, res) {
  const { path, content, branch } = req.body;

  const api = `https://api.github.com/repos/${process.env.GITHUB_OWNER}/${process.env.GITHUB_REPO}/contents/${path}`;

  const r = await fetch(api, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      message: `GOD MODE: add ${path}`,
      content: Buffer.from(content).toString("base64"),
      branch
    })
  });

  const data = await r.json();
  res.json({ ok: true, data });
}
