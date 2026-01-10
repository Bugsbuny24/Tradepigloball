const required = [
  "VITE_SUPABASE_URL",
  "VITE_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "PRINTIFY_TOKEN"
];

const missing = required.filter((k) => !process.env[k] || String(process.env[k]).trim() === "");
if (missing.length) {
  console.error("Missing env vars:", missing.join(", "));
  process.exit(1);
}
console.log("ENV OK");
