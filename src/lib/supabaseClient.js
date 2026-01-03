import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Vercel'de ENV yoksa build sırasında yakalansın diye:
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Set them in your env (Vercel Environment Variables).'
  );
}

export const supabase = createClient(supabaseUrl ?? '', supabaseAnonKey ?? '');
