export function requireAdmin(req) {
  if (!req.user || !req.user.is_app_admin) {
    throw new Error("FORBIDDEN");
  }
}
