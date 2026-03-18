import { NextResponse } from 'next/server';
import { normalizePaymentStatus } from '@/lib/paymentStatus';
import { extractMemoryIdFromMetadata, extractMemoryIdFromMockSessionId, getStripeServerClient, isMockPaymentsEnabled } from '@/lib/server/stripe';

export const runtime = 'nodejs';


export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const session_id = searchParams.get('session_id');

    if (!session_id) {
        return NextResponse.json({ status: 'invalid', error: 'missing_session_id' }, { status: 400 });
    }

    // Mock handling for demo
    if (session_id.startsWith('mock_')) {
        if (!isMockPaymentsEnabled()) {
            return NextResponse.json({ status: 'error', error: 'mock_payments_disabled' }, { status: 400 });
        }

        const memoryId = extractMemoryIdFromMockSessionId(session_id) || 'mock-memory-id';
        return NextResponse.json({
            status: 'paid',
            memoryId,
            metadata: {
                memoryId,
                memorialId: memoryId,
            },
            customer_email: 'demo@example.com'
        });
    }

    try {
        const stripe = getStripeServerClient();

        if (!stripe) {
            return NextResponse.json({
                status: 'error',
                error: 'stripe_not_configured',
            }, { status: 503 });
        }

        const session = await stripe.checkout.sessions.retrieve(session_id);
        const metadata = session.metadata || {};
        const memoryId = extractMemoryIdFromMetadata(metadata) || session.client_reference_id || null;

        return NextResponse.json({
            status: normalizePaymentStatus(session.payment_status),
            metadata,
            memoryId,
            customer_email: session.customer_details?.email,
            amount_total: session.amount_total,
            payment_intent: session.payment_intent
        });
    } catch (e: any) {
        console.error('Stripe Verify Error:', e);
        return NextResponse.json({
            status: 'error',
            error: e?.message || 'stripe_verification_failed',
        }, { status: 502 });
    }
}
