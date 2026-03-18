import { NextRequest, NextResponse } from 'next/server';
import { getProContext } from '@/app/api/pro/_shared';
import { deriveCommissionStatus, normalizePaymentStatus } from '@/lib/paymentStatus';
import { buildB2BPath, buildB2CPath, normalizePublicUrlOrPath } from '@/lib/publicUrls';

export const runtime = 'nodejs';


export async function GET(request: NextRequest) {
  try {
    const ctx = await getProContext(request);
    if (!ctx) {
      return NextResponse.json({ error: 'Unauthorized pro access' }, { status: 401 });
    }

    const { supabase } = ctx;
    const agencyId = ctx.membership.agency_id;

    let memorialsData: any[] = [];
    const withSlug = await supabase
      .from('agency_memories_view')
      .select('id, slug, public_url, created_at, payment_status, publication_status, access_status, qr_status, options_summary, dossier_label, agency_internal_note, suspended_at, suspension_reason')
      .eq('agency_id', agencyId)
      .order('created_at', { ascending: false })
      .limit(500);

    if (!withSlug.error && withSlug.data) {
      memorialsData = withSlug.data;
    } else {
      const fallback = await supabase
        .from('agency_memories_view')
        .select('id, created_at, payment_status, publication_status, access_status, qr_status, options_summary, dossier_label, agency_internal_note, suspended_at, suspension_reason')
        .eq('agency_id', agencyId)
        .order('created_at', { ascending: false })
        .limit(500);
      memorialsData = fallback.data || [];
    }

    const memorials = memorialsData.map((row: any) => {
          const label = row.dossier_label || 'Dossier';
          const memorySlug = row.slug || row.id;
          const paymentStatus = normalizePaymentStatus(row.payment_status);
          const fallbackPath = ctx.agency.slug
            ? buildB2BPath(ctx.agency.slug, memorySlug)
            : buildB2CPath(memorySlug);
          const publicPath = normalizePublicUrlOrPath(row.public_url, fallbackPath);

          return {
            id: row.id,
            familyName: label,
            subjectName: label,
            createdAt: row.created_at,
            publicUrl: publicPath,
            paymentStatus,
            totalPaid: 79,
            agencyCommission: Number(ctx.agency.commission_rate ?? 20),
            commissionStatus: deriveCommissionStatus(paymentStatus),
            accessStatus: row.access_status || 'active',
            suspendedAt: row.suspended_at || null,
            suspensionReason: row.suspension_reason || null,
            agencyInternalNote: row.agency_internal_note || null,
          };
        });

    const { data: memberRows } = await supabase
      .from('agency_users')
      .select('id, user_id, role, created_at')
      .eq('agency_id', agencyId)
      .order('created_at', { ascending: false });

    const userIds = (memberRows || []).map((m: any) => m.user_id).filter(Boolean);

    let usersMap: Record<string, { email?: string; full_name?: string }> = {};
    if (userIds.length > 0) {
      const { data: usersRows } = await supabase
        .from('users')
        .select('id, email, full_name, name')
        .in('id', userIds);

      usersMap = (usersRows || []).reduce((acc: Record<string, { email?: string; full_name?: string }>, row: any) => {
        acc[row.id] = {
          email: row.email,
          full_name: row.full_name || row.name || undefined,
        };
        return acc;
      }, {});
    }

    const team = (memberRows || []).map((member: any) => {
      const userData = usersMap[member.user_id] || {};
      return {
        id: member.id,
        fullName: userData.full_name || userData.email || 'Collaborateur',
        email: userData.email || '',
        role: member.role,
        createdAt: member.created_at,
      };
    });

    let solennRows: any[] = [];
    const { data: solennByAgency, error: solennByAgencyError } = await supabase
      .from('solenn_documents')
      .select('id, title, duration_minutes, ceremony_context, tone, created_at')
      .eq('agency_id', agencyId)
      .order('created_at', { ascending: false })
      .limit(500);

    if (!solennByAgencyError && solennByAgency) {
      solennRows = solennByAgency;
    } else {
      // Backward compatibility if agency_id column/policy is not yet active.
      const { data: fallbackSolenn } = await supabase
        .from('solenn_documents')
        .select('id, title, duration_minutes, ceremony_context, tone, created_at, user_id')
        .in('user_id', userIds.length > 0 ? userIds : [ctx.user.id])
        .order('created_at', { ascending: false })
        .limit(500);
      solennRows = fallbackSolenn || [];
    }

    const solennSessions = solennRows.map((doc: any) => ({
      id: doc.id,
      subjectName: doc.title || 'Ceremonie sans titre',
      durationMinutes: Number(doc.duration_minutes || 10),
      context: doc.ceremony_context || 'Crémation',
      tone: doc.tone || 'Narratif',
      createdAt: doc.created_at,
    }));

    const agency = {
      id: ctx.agency.id,
      name: ctx.agency.name,
      subscriptionType: ctx.agency.subscription_type,
      subscriptionPrice: Number(ctx.agency.subscription_price ?? 490),
      subscriptionRenewalDate: ctx.agency.subscription_renewal_date,
      agencyCredit: Number(ctx.agency.agency_credit ?? 0),
      commissionRate: Number(ctx.agency.commission_rate ?? 20),
      createdAt: ctx.agency.created_at,
    };

    const branding = {
      level: (ctx.agency.subscription_type as 'base' | 'pro' | 'premium') || 'pro',
      displayName: ctx.agency.display_name || ctx.agency.name,
      partnerMention: ctx.agency.partner_mention || 'En partenariat avec Commun Vivant',
      logoUrl: ctx.agency.logo_url || '',
      signature: ctx.agency.signature || '',
      primaryColor: ctx.agency.primary_color || '#13212E',
      introPageText: ctx.agency.intro_page_text || '',
      customMessage: ctx.agency.custom_message || '',
    };

    let billingDocuments: any[] = [];
    const billingQuery = await supabase
      .from('billing_documents')
      .select('id, doc_type, amount_cents, currency, status, issued_at, hosted_invoice_url, invoice_pdf_url, stripe_invoice_id')
      .eq('agency_id', agencyId)
      .order('issued_at', { ascending: false })
      .limit(100);

    if (!billingQuery.error && billingQuery.data) {
      billingDocuments = billingQuery.data.map((doc: any) => ({
        id: doc.id,
        docType: doc.doc_type || 'invoice',
        amountCents: Number(doc.amount_cents || 0),
        currency: doc.currency || 'EUR',
        status: doc.status || 'pending',
        issuedAt: doc.issued_at || new Date().toISOString(),
        hostedInvoiceUrl: doc.hosted_invoice_url || null,
        invoicePdfUrl: doc.invoice_pdf_url || null,
        stripeInvoiceId: doc.stripe_invoice_id || null,
      }));
    } else {
      const fallbackBilling = await supabase
        .from('billing_documents')
        .select('id, owner_type, amount_cents, currency, status, issued_at, hosted_invoice_url, invoice_pdf_url, stripe_invoice_id, receipt_url')
        .eq('agency_id', agencyId)
        .order('issued_at', { ascending: false })
        .limit(100);

      if (!fallbackBilling.error && fallbackBilling.data) {
        billingDocuments = fallbackBilling.data.map((doc: any) => ({
          id: doc.id,
          docType: doc.owner_type === 'agency' ? 'agency' : 'receipt',
          amountCents: Number(doc.amount_cents || 0),
          currency: doc.currency || 'EUR',
          status: doc.status || 'pending',
          issuedAt: doc.issued_at || new Date().toISOString(),
          hostedInvoiceUrl: doc.hosted_invoice_url || doc.receipt_url || null,
          invoicePdfUrl: doc.invoice_pdf_url || null,
          stripeInvoiceId: doc.stripe_invoice_id || null,
        }));
      }
    }

    return NextResponse.json({
      role: ctx.membership.role,
      agency,
      memorials,
      solennSessions,
      team,
      branding,
      billingDocuments,
    });
  } catch (error) {
    console.error('PRO dashboard error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
