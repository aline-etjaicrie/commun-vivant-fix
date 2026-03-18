import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getStripeServerClient } from '@/lib/server/stripe';
import { syncCheckoutSessionState, syncPaymentIntentStatus } from '@/lib/server/stripeSync';

export const runtime = 'nodejs';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const stripe = getStripeServerClient();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  const signature = request.headers.get('stripe-signature');

  if (!stripe || !webhookSecret) {
    return NextResponse.json({ error: 'stripe_webhook_not_configured' }, { status: 503 });
  }

  if (!signature) {
    return NextResponse.json({ error: 'missing_stripe_signature' }, { status: 400 });
  }

  const payload = await request.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (error: any) {
    console.error('Stripe webhook signature error:', error);
    return NextResponse.json({ error: 'invalid_signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
      case 'checkout.session.async_payment_succeeded':
        await syncCheckoutSessionState(event.data.object as Stripe.Checkout.Session, 'paid');
        break;
      case 'checkout.session.async_payment_failed':
        await syncCheckoutSessionState(event.data.object as Stripe.Checkout.Session, 'failed');
        break;
      case 'checkout.session.expired':
        await syncCheckoutSessionState(event.data.object as Stripe.Checkout.Session, 'canceled');
        break;
      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge;
        const paymentIntentId =
          typeof charge.payment_intent === 'string' ? charge.payment_intent : charge.payment_intent?.id || null;

        if (paymentIntentId) {
          await syncPaymentIntentStatus(paymentIntentId, 'refunded');
        }
        break;
      }
      default:
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Stripe webhook processing error:', error);
    return NextResponse.json({ error: error?.message || 'webhook_processing_failed' }, { status: 500 });
  }
}
