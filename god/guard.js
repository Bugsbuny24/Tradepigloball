import { ENV } from "../lib/env";

export function isGod(user) {
  if (!ENV.GOD_MODE) return false;
  if (!user?.email) return false;
  return ENV.GOD_EMAILS.includes(user.email);
}
