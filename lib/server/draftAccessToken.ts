import crypto from 'node:crypto';

function getDraftAccessSecret(): string {
  const secret = process.env.DRAFT_MEMORY_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!secret) {
    throw new Error('Missing draft access secret');
  }
  return secret;
}

function signPayload(payload: string): string {
  return crypto.createHmac('sha256', getDraftAccessSecret()).update(payload).digest('base64url');
}

export function createDraftAccessToken(memoryId: string, ttlSeconds = 60 * 60 * 6): string {
  const expiresAt = Date.now() + ttlSeconds * 1000;
  const payload = `${memoryId}.${expiresAt}`;
  const encodedPayload = Buffer.from(payload, 'utf8').toString('base64url');
  const signature = signPayload(payload);
  return `${encodedPayload}.${signature}`;
}

export function verifyDraftAccessToken(token: string, memoryId: string): boolean {
  const [encodedPayload, signature] = String(token || '').split('.');
  if (!encodedPayload || !signature) return false;

  let payload = '';
  try {
    payload = Buffer.from(encodedPayload, 'base64url').toString('utf8');
  } catch {
    return false;
  }

  const [tokenMemoryId, rawExpiresAt] = payload.split('.');
  if (!tokenMemoryId || tokenMemoryId !== memoryId) return false;

  const expiresAt = Number(rawExpiresAt);
  if (!Number.isFinite(expiresAt) || expiresAt <= Date.now()) return false;

  const expectedSignature = signPayload(payload);
  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (signatureBuffer.length !== expectedBuffer.length) return false;

  return crypto.timingSafeEqual(signatureBuffer, expectedBuffer);
}
