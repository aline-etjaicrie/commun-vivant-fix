import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase URL:', supabaseUrl);
  console.error('Supabase Key:', supabaseAnonKey ? 'existe' : 'manquante');
  throw new Error('Missing Supabase environment variables. Check .env.local');
}

if (!supabaseUrl.startsWith('https://')) {
  console.warn('WARNING: Supabase URL does not start with https://. This may cause connection issues.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);