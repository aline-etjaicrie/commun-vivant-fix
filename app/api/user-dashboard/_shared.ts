import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export function getSupabaseClient(authHeader: string | null) {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    global: {
      headers: {
        Authorization: authHeader || '',
      },
    },
  });
}

export async function getAuthenticatedUser(request: NextRequest): Promise<{ supabase: any; user: any | null }> {
  const supabase = getSupabaseClient(request.headers.get('authorization'));
  const { data: { user } } = await supabase.auth.getUser();
  return { supabase, user };
}
