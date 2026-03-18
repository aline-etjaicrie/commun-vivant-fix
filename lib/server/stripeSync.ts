import Stripe from 'stripe';
import { isUuid } from '@/lib/ids';
import { normalizePaymentStatus } from '@/lib/paymentStatus';
import { extractMemoryIdFromMetadata } from '@/lib/server/stripe';
import { getSupabaseAdmin } from '@/lib/server/supabaseAdmin';

type SyncedPaymentStatus = ReturnType<typeof normalizePaymentStatus>;

type MemoryRow = {
  id: string;
  user_id?: string | null;
  owner_user_id?: string | null;
  agency_id?: string | null;
  payment_status?: string | null;
  commission_status?: string | null;
  agency_commission?: number | null;
  total_paid?: number | null;
};

function toEuros(amountCents?: number | null): number {
  return Number(((amountCents || 0) / 100).toFixed(2));
}

function parseMetadataNumber(value: unknown, fallback = 0): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function resolveLegacyContext(value?: string | null): 'funeral' | 'living_story' | 'object_memory' {
  if (value === 'living_story' || value === 'celebration' || value === 'feter') {
    return 'living_story';
  }

  if (value === 'object_memory' || value === 'heritage' || value === 'transmettre') {
    return 'object_memory';
  }

  return 'funeral';
}

function resolveBillingStatus(status: SyncedPaymentStatus): 'issued' | 'paid' | 'void' | 'refunded' {
  if (status === 'paid') return 'paid';
  if (status === 'refunded' || status === 'chargeback') return 'refunded';
  return 'void';
}

function resolveTransactionStatus(status: SyncedPaymentStatus): 'pending' | 'completed' | 'failed' | 'refunded' {
  if (status === 'paid') return 'completed';
  if (status === 'refunded' || status === 'chargeback') return 'refunded';
  if (status === 'failed' || status === 'canceled') return 'failed';
  return 'pending';
}

function resolveMetadataUserId(session: Stripe.Checkout.Session): string | null {
  const candidate = String(session.metadata?.userId || '').trim();
  return isUuid(candidate) ? candidate : null;
}

async function fetchMemory(admin: any, memoryId: string): Promise<MemoryRow | null> {
  const { data, error } = await admin
    .from('memories')
    .select('id, user_id, owner_user_id, agency_id, payment_status, commission_status, agency_commission, total_paid')
    .eq('id', memoryId)
    .maybeSingle();

  if (error) {
    console.error('Stripe sync: unable to read memory', error);
    return null;
  }

  return data || null;
}

async function reverseAgencyCommission(admin: any, memory: MemoryRow): Promise<void> {
  if (!memory.agency_id || memory.commission_status !== 'accounted') {
    return;
  }

  const commissionAmount = Number(memory.agency_commission ?? 20);

  const { data: agency, error: agencyReadError } = await admin
    .from('agencies')
    .select('agency_credit')
    .eq('id', memory.agency_id)
    .maybeSingle();

  if (agencyReadError) {
    console.error('Stripe sync: unable to read agency credit', agencyReadError);
    return;
  }

  const currentCredit = Number(agency?.agency_credit ?? 0);
  const { error: agencyUpdateError } = await admin
    .from('agencies')
    .update({ agency_credit: currentCredit - commissionAmount })
    .eq('id', memory.agency_id);

  if (agencyUpdateError) {
    console.error('Stripe sync: unable to reverse agency credit', agencyUpdateError);
  }
}

async function applyPaymentStateToMemory(params: {
  admin: any;
  memoryId: string;
  nextStatus: SyncedPaymentStatus;
  amountEuros: number;
  userId?: string | null;
  context?: string | null;
}): Promise<MemoryRow | null> {
  const { admin, memoryId, nextStatus, amountEuros, userId, context } = params;
  const now = new Date().toISOString();
  let memory = await fetchMemory(admin, memoryId);

  if (!memory && nextStatus !== 'paid') {
    return null;
  }

  if (!memory) {
    const insertPayload: Record<string, any> = {
      id: memoryId,
      user_id: userId || null,
      owner_user_id: userId || null,
      created_by: 'user',
      payment_status: nextStatus,
      total_paid: amountEuros,
      publication_status: 'draft',
      status: 'draft',
      updated_at: now,
      paid_at: nextStatus === 'paid' ? now : null,
    };

    if (context) {
      insertPayload.context = resolveLegacyContext(context);
    }

    const { error: insertError } = await admin.from('memories').insert(insertPayload);
    if (insertError) {
      console.error('Stripe sync: unable to create memory', insertError);
      return null;
    }

    memory = await fetchMemory(admin, memoryId);
    return memory;
  }

  const currentStatus = normalizePaymentStatus(memory.payment_status);
  const updatePayload: Record<string, any> = {
    payment_status: nextStatus,
    total_paid: amountEuros,
    updated_at: now,
  };

  if (nextStatus === 'paid' && currentStatus !== 'paid') {
    updatePayload.paid_at = now;
  }

  if (
    currentStatus === 'paid' &&
    (nextStatus === 'refunded' || nextStatus === 'chargeback' || nextStatus === 'failed' || nextStatus === 'canceled')
  ) {
    await reverseAgencyCommission(admin, memory);
    updatePayload.commission_status = 'reversed';
  }

  const { error: updateError } = await admin.from('memories').update(updatePayload).eq('id', memoryId);
  if (updateError) {
    console.error('Stripe sync: unable to update memory', updateError);
  }

  return {
    ...memory,
    ...updatePayload,
  };
}

async function upsertBillingDocument(params: {
  admin: any;
  memory: MemoryRow | null;
  session: Stripe.Checkout.Session;
  nextStatus: SyncedPaymentStatus;
  fallbackUserId?: string | null;
}): Promise<void> {
  const { admin, memory, session, nextStatus, fallbackUserId } = params;
  const paymentIntentId =
    typeof session.payment_intent === 'string'
      ? session.payment_intent
      : session.payment_intent?.id || null;

  if (!paymentIntentId) {
    return;
  }

  const ownerType = memory?.agency_id && !memory?.owner_user_id && !memory?.user_id && !fallbackUserId ? 'agency' : 'user';
  const ownerUserId = memory?.owner_user_id || memory?.user_id || fallbackUserId || null;

  if (ownerType === 'user' && !ownerUserId && !memory?.agency_id) {
    return;
  }

  const payload = {
    owner_type: ownerType,
    agency_id: memory?.agency_id || null,
    user_id: ownerType === 'user' ? ownerUserId : null,
    memory_id: memory?.id || null,
    stripe_invoice_id: null,
    stripe_payment_intent_id: paymentIntentId,
    hosted_invoice_url: null,
    receipt_url: null,
    invoice_pdf_url: null,
    amount_cents: Number(session.amount_total || 0),
    currency: String(session.currency || 'eur').toLowerCase(),
    tax_amount_cents: 0,
    status: resolveBillingStatus(nextStatus),
    issued_at: new Date().toISOString(),
  };

  const { data: existing, error: readError } = await admin
    .from('billing_documents')
    .select('id')
    .eq('stripe_payment_intent_id', paymentIntentId)
    .maybeSingle();

  if (readError) {
    console.error('Stripe sync: unable to read billing document', readError);
    return;
  }

  if (existing?.id) {
    const { error: updateError } = await admin
      .from('billing_documents')
      .update(payload)
      .eq('id', existing.id);

    if (updateError) {
      console.error('Stripe sync: unable to update billing document', updateError);
    }
    return;
  }

  const { error: insertError } = await admin.from('billing_documents').insert(payload);
  if (insertError) {
    console.error('Stripe sync: unable to insert billing document', insertError);
  }
}

async function syncLegacyAlmaPayment(params: {
  admin: any;
  session: Stripe.Checkout.Session;
  memoryId: string;
  nextStatus: SyncedPaymentStatus;
  userId?: string | null;
}): Promise<void> {
  const { admin, session, memoryId, nextStatus, userId } = params;

  if (!isUuid(memoryId)) {
    return;
  }

  const metadata = session.metadata || {};
  const basePrice = parseMetadataNumber(metadata.basePrice, toEuros(session.amount_total));
  const totalPaid = parseMetadataNumber(metadata.totalPaid, toEuros(session.amount_total));

  const { error: commonsError } = await admin.from('commons').upsert({
    id: memoryId,
    context: resolveLegacyContext(String(metadata.context || 'funeral')),
    status: 'draft',
    base_price: basePrice,
    total_paid: totalPaid,
    created_by: userId || null,
    owned_by: userId || null,
    created_at: new Date().toISOString(),
  });

  if (commonsError) {
    console.error('Stripe sync: unable to upsert legacy common', commonsError);
    return;
  }

  const stripePaymentId =
    (typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id) || session.id;

  const { data: existingTransaction, error: transactionReadError } = await admin
    .from('transactions')
    .select('id')
    .eq('stripe_payment_id', stripePaymentId)
    .maybeSingle();

  if (transactionReadError) {
    console.error('Stripe sync: unable to read legacy transaction', transactionReadError);
    return;
  }

  const transactionPayload = {
    common_id: memoryId,
    type: 'base_publication',
    amount: totalPaid,
    platform_revenue: totalPaid,
    payment_status: resolveTransactionStatus(nextStatus),
    stripe_payment_id: stripePaymentId,
    created_at: new Date().toISOString(),
  };

  if (existingTransaction?.id) {
    const { error: updateError } = await admin
      .from('transactions')
      .update(transactionPayload)
      .eq('id', existingTransaction.id);

    if (updateError) {
      console.error('Stripe sync: unable to update legacy transaction', updateError);
    }
    return;
  }

  const { error: insertError } = await admin.from('transactions').insert(transactionPayload);
  if (insertError) {
    console.error('Stripe sync: unable to insert legacy transaction', insertError);
  }
}

export async function syncCheckoutSessionState(
  session: Stripe.Checkout.Session,
  forcedStatus?: SyncedPaymentStatus
): Promise<void> {
  const admin = getSupabaseAdmin();
  const metadata = session.metadata || {};
  const memoryId = extractMemoryIdFromMetadata(metadata) || session.client_reference_id || '';
  const nextStatus = forcedStatus || normalizePaymentStatus(session.payment_status);
  const amountEuros = toEuros(session.amount_total);
  const userId = resolveMetadataUserId(session);

  const memory =
    isUuid(memoryId)
      ? await applyPaymentStateToMemory({
          admin,
          memoryId,
          nextStatus,
          amountEuros,
          userId,
          context: String(metadata.context || ''),
        })
      : null;

  await upsertBillingDocument({
    admin,
    memory,
    session,
    nextStatus,
    fallbackUserId: userId,
  });

  if (metadata.type === 'alma_memorial_creation') {
    await syncLegacyAlmaPayment({
      admin,
      session,
      memoryId,
      nextStatus,
      userId,
    });
  }
}

export async function syncPaymentIntentStatus(
  paymentIntentId: string,
  nextStatus: SyncedPaymentStatus
): Promise<void> {
  const admin = getSupabaseAdmin();

  const { data: billingDoc, error } = await admin
    .from('billing_documents')
    .select('id, memory_id')
    .eq('stripe_payment_intent_id', paymentIntentId)
    .maybeSingle();

  if (error) {
    console.error('Stripe sync: unable to find billing document by payment intent', error);
    return;
  }

  if (billingDoc?.id) {
    const { error: updateDocError } = await admin
      .from('billing_documents')
      .update({ status: resolveBillingStatus(nextStatus) })
      .eq('id', billingDoc.id);

    if (updateDocError) {
      console.error('Stripe sync: unable to update billing status', updateDocError);
    }
  }

  if (billingDoc?.memory_id) {
    const memory = await fetchMemory(admin, billingDoc.memory_id);
    if (memory) {
      await applyPaymentStateToMemory({
        admin,
        memoryId: billingDoc.memory_id,
        nextStatus,
        amountEuros: Number(memory.total_paid ?? 0),
        userId: memory.owner_user_id || memory.user_id || null,
      });
    }
  }

  const { data: legacyTransaction, error: legacyReadError } = await admin
    .from('transactions')
    .select('id')
    .eq('stripe_payment_id', paymentIntentId)
    .maybeSingle();

  if (legacyReadError) {
    console.error('Stripe sync: unable to read legacy transaction by payment intent', legacyReadError);
    return;
  }

  if (legacyTransaction?.id) {
    const { error: updateLegacyError } = await admin
      .from('transactions')
      .update({ payment_status: resolveTransactionStatus(nextStatus) })
      .eq('id', legacyTransaction.id);

    if (updateLegacyError) {
      console.error('Stripe sync: unable to update legacy transaction status', updateLegacyError);
    }
  }
}
