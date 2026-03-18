import type { CommissionStatus, MemorialPaymentStatus } from '@/lib/pro/types';

export const SUCCESSFUL_PAYMENT_STATUSES = ['paid', 'completed', 'approved'] as const;

export function normalizePaymentStatus(value?: string | null): MemorialPaymentStatus {
  const normalized = String(value || '').trim().toLowerCase();

  if (SUCCESSFUL_PAYMENT_STATUSES.includes(normalized as (typeof SUCCESSFUL_PAYMENT_STATUSES)[number])) {
    return 'paid';
  }

  if (normalized === 'canceled' || normalized === 'cancelled') {
    return 'canceled';
  }

  if (normalized === 'chargeback' || normalized === 'disputed') {
    return 'chargeback';
  }

  if (normalized === 'failed') {
    return 'failed';
  }

  if (normalized === 'refunded') {
    return 'refunded';
  }

  return 'pending';
}

export function isPaidPaymentStatus(value?: string | null): boolean {
  return normalizePaymentStatus(value) === 'paid';
}

export function deriveCommissionStatus(value?: string | null): CommissionStatus {
  const paymentStatus = normalizePaymentStatus(value);

  if (paymentStatus === 'paid') {
    return 'accounted';
  }

  if (paymentStatus === 'failed' || paymentStatus === 'canceled' || paymentStatus === 'refunded' || paymentStatus === 'chargeback') {
    return 'reversed';
  }

  return 'pending';
}
