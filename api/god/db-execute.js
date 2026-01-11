// api/god/db-execute.js (EN ÜST)
import crypto from "crypto";

const GOD_EMAILS = process.env.GOD_EMAILS?.split(",") ?? [];

if (process.env.EMERGENCY_LOCK === "true") {
  return res.status(503).json({ error: "SYSTEM LOCKED" });
}

if (!process.env.GOD_EMAILS) {
  return res.status(403).json({ error: "GOD MODE DISABLED" });
}

if (
  !req.user ||
  !req.user.is_app_admin ||
  !GOD_EMAILS.includes(req.user.email)
) {
  return res.status(403).json({ error: "GOD MODE ONLY" });
}
