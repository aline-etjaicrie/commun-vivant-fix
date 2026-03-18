import Stripe from 'stripe';

let stripeClient: Stripe | null | undefined;

const DEFAULT_LOCAL_DOMAIN = 'http://localhost:3000';

function getAppBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    DEFAULT_LOCAL_DOMAIN
  );
}

export function isMockPaymentsEnabled(): boolean {
  return process.env.ALLOW_MOCK_PAYMENTS === 'true';
}

export function getStripeServerClient(): Stripe | null {
  const secretKey = process.env.STRIPE_SECRET_KEY?.trim();

  if (!secretKey) {
    return null;
  }

  if (stripeClient !== undefined) {
    return stripeClient;
  }

  stripeClient = new Stripe(secretKey, {
    apiVersion: '2023-10-16' as any,
  });

  return stripeClient;
}

export function buildUrlWithParams(
  pathOrUrl: string,
  params: Record<string, string | undefined>
): string {
  const url = new URL(pathOrUrl, getAppBaseUrl());

  Object.entries(params).forEach(([key, value]) => {
    if (typeof value === 'string' && value.length > 0) {
      url.searchParams.set(key, value);
    }
  });

  return url.toString();
}

export function buildMockSessionId(memoryId?: string | null): string {
  const fallback = 'demo';
  const safeMemoryId = String(memoryId || fallback).trim() || fallback;
  return `mock_session_${safeMemoryId}`;
}

export function extractMemoryIdFromMockSessionId(sessionId: string): string | null {
  const memoryId = sessionId.replace(/^mock_session_/, '').trim();
  return memoryId || null;
}

export function extractMemoryIdFromMetadata(metadata?: Stripe.Metadata | null): string | null {
  const memoryId = String(metadata?.memoryId || metadata?.memorialId || '').trim();
  return memoryId || null;
}
