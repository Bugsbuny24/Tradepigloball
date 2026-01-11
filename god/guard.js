import { ENV } from "../lib/env";

export function isGod(user) {
  if (ENV.APP_ENV === "production" && ENV.GOD_MODE !== true) return false;
  if (!ENV.GOD_MODE) return false;
  if (!user?.email) return false;
  return ENV.GOD_EMAILS.includes(user.email);
}
