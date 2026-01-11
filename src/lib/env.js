export const ENV = {
  APP_NAME: import.meta.env.VITE_APP_NAME,
  APP_ENV: import.meta.env.VITE_APP_ENV,

  SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
  SUPABASE_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,

  FEATURE_DEBUG: import.meta.env.VITE_FEATURE_DEBUG === "true",

  GOD_MODE: import.meta.env.VITE_GOD_MODE === "true",
  GOD_EMAILS: (import.meta.env.VITE_GOD_EMAILS || "").split(","),

  API_BASE_URL: import.meta.env.VITE_API_BASE_URL,

  CREDIT_SYMBOL: import.meta.env.VITE_CREDIT_SYMBOL,
  CREDIT_DECIMALS: Number(import.meta.env.VITE_CREDIT_DECIMALS || 6),

  VERCEL_ENV: import.meta.env.VITE_VERCEL_ENV,
};
