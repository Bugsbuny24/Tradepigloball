import { supabase } from './lib/supabaseClient';

const { data, error } = await supabase
  .from('company_users')
  .select('company_id, role, companies(name, country)')
  .eq('user_id', supabase.auth.user().id); // or serverless session
