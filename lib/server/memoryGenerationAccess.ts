import { NextRequest } from 'next/server';
import { normalizePaymentStatus } from '@/lib/paymentStatus';
import { verifyDraftAccessToken } from '@/lib/server/draftAccessToken';
import { extractMemoryIdFromMetadata, getStripeServerClient } from '@/lib/server/stripe';
import {
  getMemoryAccessProfile,
  hasAdministrativeMemoryRole,
  type MemoryCollaboratorRole,
} from '@/lib/server/memoryCollaboration';
import { getSupabaseAdmin } from '@/lib/server/supabaseAdmin';
import { getAuthenticatedUser } from '@/app/api/user-dashboard/_shared';

type AuthGenerationAccess = {
  ok: true;
  admin: any;
  memory: any;
  mode: 'auth';
  actorUserId: string;
  actorEmail: string | null;
  actorRole: MemoryCollaboratorRole;
  source: 'dashboard';
};

type CheckoutGenerationAccess = {
  ok: true;
  admin: any;
  memory: any;
  mode: 'checkout';
  actorUserId: null;
  actorEmail: string | null;
  actorRole: 'owner';
  source: 'checkout_confirmation';
};

type DraftGenerationAccess = {
  ok: true;
  admin: any;
  memory: any;
  mode: 'draft';
  actorUserId: null;
  actorEmail: null;
  actorRole: 'owner';
  source: 'creation_flow';
};

type DeniedGenerationAccess = {
  ok: false;
  status: number;
  error: string;
};

export type MemoryGenerationAccess =
  | AuthGenerationAccess
  | CheckoutGenerationAccess
  | DraftGenerationAccess
  | DeniedGenerationAccess;

export async function authorizeMemoryGeneration(params: {
  request: NextRequest;
  memoryId: string;
  allowPaidCheckoutSessionId?: string | null;
  draftToken?: string | null;
}): Promise<MemoryGenerationAccess> {
  const { request, memoryId, allowPaidCheckoutSessionId, draftToken } = params;
  const admin = getSupabaseAdmin();

  const { user } = await getAuthenticatedUser(request);
  if (user) {
    const accessProfile = await getMemoryAccessProfile(admin, memoryId, user.id);
    const actorRole = accessProfile.role;

    if (!accessProfile.memory) {
      return { ok: false, status: 404, error: 'Memory not found' };
    }

    if (!actorRole || !hasAdministrativeMemoryRole(actorRole)) {
      return { ok: false, status: 403, error: 'Forbidden' };
    }

    return {
      ok: true,
      admin,
      memory: accessProfile.memory,
      mode: 'auth',
      actorUserId: user.id,
      actorEmail: user.email || null,
      actorRole,
      source: 'dashboard',
    };
  }

  if (draftToken) {
    const { data: memory, error } = await admin
      .from('memories')
      .select('*')
      .eq('id', memoryId)
      .maybeSingle();

    if (error || !memory) {
      return { ok: false, status: 404, error: 'Memory not found' };
    }

    if (memory.user_id || memory.owner_user_id) {
      return { ok: false, status: 401, error: 'Unauthorized' };
    }

    if (!verifyDraftAccessToken(draftToken, memoryId)) {
      return { ok: false, status: 403, error: 'invalid_draft_token' };
    }

    return {
      ok: true,
      admin,
      memory,
      mode: 'draft',
      actorUserId: null,
      actorEmail: null,
      actorRole: 'owner',
      source: 'creation_flow',
    };
  }

  if (!allowPaidCheckoutSessionId) {
    return { ok: false, status: 401, error: 'Unauthorized' };
  }

  const stripe = getStripeServerClient();
  if (!stripe) {
    return { ok: false, status: 503, error: 'stripe_not_configured' };
  }

  const session = await stripe.checkout.sessions.retrieve(allowPaidCheckoutSessionId);
  const paymentStatus = normalizePaymentStatus(session.payment_status);
  const sessionMemoryId = extractMemoryIdFromMetadata(session.metadata) || session.client_reference_id || null;

  if (paymentStatus !== 'paid') {
    return { ok: false, status: 403, error: 'checkout_not_paid' };
  }

  if (!sessionMemoryId || String(sessionMemoryId) !== String(memoryId)) {
    return { ok: false, status: 403, error: 'checkout_memory_mismatch' };
  }

  const { data: memory, error } = await admin
    .from('memories')
    .select('*')
    .eq('id', memoryId)
    .single();

  if (error || !memory) {
    return { ok: false, status: 404, error: 'Memory not found' };
  }

  return {
    ok: true,
    admin,
    memory,
    mode: 'checkout',
    actorUserId: null,
    actorEmail: session.customer_details?.email || session.customer_email || null,
    actorRole: 'owner',
    source: 'checkout_confirmation',
  };
}
