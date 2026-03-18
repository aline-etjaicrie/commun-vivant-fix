import { NextResponse } from 'next/server';

export const runtime = 'nodejs';


function getProjectRef(url: string): string {
  try {
    const hostname = new URL(url).hostname;
    return hostname.split('.')[0] || 'unknown';
  } catch {
    return 'invalid_url';
  }
}

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  const env = {
    hasUrl: Boolean(url),
    hasAnonKey: Boolean(anonKey),
    projectRef: url ? getProjectRef(url) : null,
  };

  if (!env.hasUrl || !env.hasAnonKey) {
    return NextResponse.json(
      {
        ok: false,
        env,
        checks: {
          authHealthReachable: false,
          authHealthStatus: null,
        },
        error: 'Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY',
      },
      { status: 500 }
    );
  }

  let authHealthReachable = false;
  let authHealthStatus: number | null = null;
  let authHealthError: string | null = null;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);
    const response = await fetch(`${url}/auth/v1/health`, {
      method: 'GET',
      cache: 'no-store',
      signal: controller.signal,
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
      },
    });
    clearTimeout(timeout);
    authHealthStatus = response.status;
    authHealthReachable = response.ok;
  } catch (error: any) {
    authHealthError = error?.message || 'fetch_failed';
  }

  return NextResponse.json({
    ok: env.hasUrl && env.hasAnonKey && authHealthReachable,
    env,
    checks: {
      authHealthReachable,
      authHealthStatus,
      authHealthError,
    },
  });
}
