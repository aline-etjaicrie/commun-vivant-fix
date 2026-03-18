import { createClient } from '@supabase/supabase-js';

export class MissingSupabaseAdminEnvironmentError extends Error {
  constructor() {
    super('Missing Supabase admin environment variables');
    this.name = 'MissingSupabaseAdminEnvironmentError';
  }
}

export function isMissingSupabaseAdminEnvironmentError(error: unknown): boolean {
  return (
    error instanceof MissingSupabaseAdminEnvironmentError ||
    (error instanceof Error && error.message === 'Missing Supabase admin environment variables')
  );
}

export function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRole) {
    throw new MissingSupabaseAdminEnvironmentError();
  }

  return createClient(url, serviceRole, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
