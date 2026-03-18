import { ProDashboardState } from '@/lib/pro/types';

export const DEFAULT_MEMORIAL_PRICE = 79;
export const DEFAULT_COMMISSION = 20;

export interface CommissionSummary {
  soldCount: number;
  commissionCumulative: number;
  currentCredit: number;
  renewalDate: string;
  renewalGap: number;
  isRenewalCovered: boolean;
  annualTransferEligibleAmount: number;
}

export function computeCommissionSummary(state: ProDashboardState): CommissionSummary {
  const paidMemorials = state.memorials.filter((m) => m.paymentStatus === 'paid');
  const soldCount = paidMemorials.length;
  const commissionCumulative = paidMemorials.reduce((acc, curr) => acc + curr.agencyCommission, 0);
  const currentCredit = state.agency.agencyCredit;
  const renewalGap = Math.max(0, state.agency.subscriptionPrice - currentCredit);
  const isRenewalCovered = currentCredit >= state.agency.subscriptionPrice;
  const annualTransferEligibleAmount = Math.max(0, currentCredit - state.agency.subscriptionPrice - 300);

  return {
    soldCount,
    commissionCumulative,
    currentCredit,
    renewalDate: state.agency.subscriptionRenewalDate,
    renewalGap,
    isRenewalCovered,
    annualTransferEligibleAmount,
  };
}

export function applyCommissionOnPaidMemorial(params: {
  currentCredit: number;
  commissionRate: number;
  paymentStatusBefore: 'pending' | 'paid';
  paymentStatusAfter: 'pending' | 'paid';
}): number {
  const { currentCredit, commissionRate, paymentStatusBefore, paymentStatusAfter } = params;
  if (paymentStatusBefore === 'pending' && paymentStatusAfter === 'paid') {
    return currentCredit + commissionRate;
  }
  return currentCredit;
}
