import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export type ProRole = 'admin' | 'editor' | 'viewer' | 'accountant';

export interface ProContext {
  supabase: any;
  user: { id: string; email?: string | null };
  membership: { agency_id: string; role: ProRole };
  agency: {
    id: string;
    name: string;
    subscription_type: string;
    subscription_price: number;
    subscription_renewal_date: string;
    agency_credit: number;
    commission_rate: number;
    created_at: string;
    display_name?: string | null;
    partner_mention?: string | null;
    logo_url?: string | null;
    signature?: string | null;
    primary_color?: string | null;
    intro_page_text?: string | null;
    custom_message?: string | null;
    slug?: string | null;
  };
}

export function getSupabaseClient(authHeader: string | null) {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    global: {
      headers: {
        Authorization: authHeader || '',
      },
    },
  });
}

export async function getProContext(request: NextRequest): Promise<ProContext | null> {
  const supabase = getSupabaseClient(request.headers.get('authorization'));

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: memberships, error: membershipError } = await supabase
    .from('agency_users')
    .select('agency_id, role')
    .eq('user_id', user.id)
    .limit(1);

  if (membershipError || !memberships || memberships.length === 0) {
    return null;
  }

  const rawRole = String(memberships[0]?.role || 'viewer');
  const normalizedRole: ProRole =
    rawRole === 'redacteur'
      ? 'editor'
      : rawRole === 'lecture'
      ? 'viewer'
      : rawRole === 'comptable'
      ? 'accountant'
      : (rawRole as ProRole);
  const membership = { agency_id: memberships[0].agency_id, role: normalizedRole } as { agency_id: string; role: ProRole };

  const { data: agency, error: agencyError } = await supabase
    .from('agencies')
    .select('*')
    .eq('id', membership.agency_id)
    .single();

  if (agencyError || !agency) {
    return null;
  }

  return {
    supabase,
    user: { id: user.id, email: user.email },
    membership,
    agency,
  };
}

export function isWriteRole(role: ProRole): boolean {
  return role === 'admin' || role === 'editor';
}

export function isAdminRole(role: ProRole): boolean {
  return role === 'admin';
}
