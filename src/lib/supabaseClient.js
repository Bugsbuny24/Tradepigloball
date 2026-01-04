import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Vercel'de ENV yoksa build sırasında yakalamak için
if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    'Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Set them in your .env file or Vercel environment variables'
  );
  throw new Error('Supabase credentials are missing!');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
