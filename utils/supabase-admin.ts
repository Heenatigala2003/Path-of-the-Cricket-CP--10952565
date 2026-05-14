import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL in .env.local');
}
if (!supabaseServiceRole) {
  throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY in .env.local');
}

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRole);