import axios from "axios";

export default async function handler(req, res) {
  try {
    const api = axios.create({
      baseURL: "https://api.printify.com/v1",
      headers: {
        Authorization: `Bearer ${process.env.PRINTIFY_API_KEY}`,
        "Content-Type": "application/json"
      }
    });

    const { data } = await api.get("/shops.json");
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({
      error: "Printify shops error",
      details: err?.response?.data || err.message
    });
  }
}
