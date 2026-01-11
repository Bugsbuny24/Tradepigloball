export function guardIP(req) {
  const ips = process.env.GOD_IPS?.split(",") ?? [];
  const ip = req.headers["x-forwarded-for"];
  if (!ips.includes(ip)) {
    throw new Error("IP BLOCKED");
  }
}
