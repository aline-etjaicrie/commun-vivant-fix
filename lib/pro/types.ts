export type AgencyPlan = 'base' | 'pro' | 'premium';

export type TeamRole = 'admin' | 'editor' | 'viewer' | 'accountant';

export type MemorialPaymentStatus = 'pending' | 'paid' | 'failed' | 'canceled' | 'refunded' | 'chargeback';
export type CommissionStatus = 'pending' | 'accounted' | 'reversed';

export interface AgencyAccount {
  id: string;
  name: string;
  subscriptionType: AgencyPlan;
  subscriptionPrice: number;
  subscriptionRenewalDate: string;
  agencyCredit: number;
  commissionRate: number;
  createdAt: string;
}

export interface ProMemorial {
  id: string;
  familyName: string;
  subjectName: string;
  createdAt: string;
  publicUrl: string;
  paymentStatus: MemorialPaymentStatus;
  totalPaid: number;
  agencyCommission: number;
  commissionStatus: CommissionStatus;
  accessStatus?: 'active' | 'suspended';
  suspendedAt?: string | null;
  suspensionReason?: string | null;
  agencyInternalNote?: string | null;
}

export interface SolennSession {
  id: string;
  subjectName: string;
  durationMinutes: 5 | 10 | 15;
  context: 'Crémation' | 'Inhumation' | 'Cérémonie intime';
  tone: 'Sobre' | 'Narratif' | 'Chaleureux';
  createdAt: string;
}

export interface TeamMember {
  id: string;
  fullName: string;
  email: string;
  role: TeamRole;
  createdAt: string;
}

export interface AgencyBranding {
  level: AgencyPlan;
  displayName: string;
  partnerMention: string;
  logoUrl?: string;
  signature?: string;
  primaryColor?: string;
  introPageText?: string;
  customMessage?: string;
}

export interface AgencyBillingDocument {
  id: string;
  docType: string;
  amountCents: number;
  currency: string;
  status: string;
  issuedAt: string;
  hostedInvoiceUrl?: string | null;
  invoicePdfUrl?: string | null;
  stripeInvoiceId?: string | null;
}

export interface ProDashboardState {
  agency: AgencyAccount;
  memorials: ProMemorial[];
  solennSessions: SolennSession[];
  team: TeamMember[];
  branding: AgencyBranding;
  billingDocuments: AgencyBillingDocument[];
}
