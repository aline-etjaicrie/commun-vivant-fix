import { NextResponse } from 'next/server';
import { buildMockSessionId, buildUrlWithParams, getStripeServerClient, isMockPaymentsEnabled } from '@/lib/server/stripe';

export const runtime = 'nodejs';


function firstNonEmptyString(...values: unknown[]): string {
    for (const value of values) {
        if (typeof value === 'string' && value.trim()) {
            return value.trim();
        }
    }
    return '';
}

function toAmountInCents(value: unknown): number {
    const amount = Number(value);
    if (!Number.isFinite(amount) || amount <= 0) {
        return 0;
    }
    return Math.round(amount);
}

function toAmountInEuros(value: unknown): number {
    const amount = Number(value);
    if (!Number.isFinite(amount) || amount <= 0) {
        return 0;
    }
    return amount;
}

export async function POST(req: Request) {
    const body = await req.json().catch(() => null);

    if (!body || typeof body !== 'object') {
        return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    try {
        const {
            memoryId,
            memorialId,
            packId,
            email,
            items,
            // Alma-specific fields
            context,
            basePrice,
            totalPrice,
            selectedOptions,
            userId,
            returnUrl
        } = body;

        const normalizedMemoryId = firstNonEmptyString(memoryId, memorialId);

        // Determine if this is an Alma request
        const isAlmaRequest = !items && basePrice !== undefined && totalPrice !== undefined;

        if (!normalizedMemoryId) {
            return NextResponse.json({ error: 'Missing memoryId' }, { status: 400 });
        }

        let lineItems: any[];
        let successUrl: string;
        let cancelUrl: string;
        let metadata: any;

        if (isAlmaRequest) {
            const normalizedBasePrice = toAmountInEuros(basePrice);
            const normalizedTotalPrice = toAmountInEuros(totalPrice);

            if (!normalizedBasePrice || !normalizedTotalPrice) {
                return NextResponse.json({ error: 'Invalid alma pricing payload' }, { status: 400 });
            }

            // Alma flow
            lineItems = [
                {
                    price_data: {
                        currency: 'eur',
                        product_data: {
                            name: `Mémorial Alma - ${context === 'object_memory' ? 'Objet de mémoire' : context === 'living_story' ? 'Histoire vivante' : 'Hommage funéraire'}`,
                            description: 'Création de mémorial avec IA Alma',
                        },
                        unit_amount: Math.round(normalizedBasePrice * 100),
                    },
                    quantity: 1,
                },
            ];

            // Add selected options as line items
            if (selectedOptions && selectedOptions.length > 0) {
                selectedOptions.forEach((option: any) => {
                    lineItems.push({
                        price_data: {
                            currency: 'eur',
                            product_data: {
                                name: option.label,
                                description: 'Option supplémentaire',
                            },
                            unit_amount: Math.round(toAmountInEuros(option.price) * 100),
                        },
                        quantity: 1,
                    });
                });
            }

            successUrl = buildUrlWithParams(returnUrl || '/alma/confirmation', {
                session_id: '{CHECKOUT_SESSION_ID}',
                memorial_id: normalizedMemoryId,
            });
            cancelUrl = buildUrlWithParams('/alma/pricing', { canceled: 'true' });

            metadata = {
                memoryId: normalizedMemoryId,
                memorialId: normalizedMemoryId,
                packId: packId || 'alma_base',
                type: 'alma_memorial_creation',
                context: context || '',
                userId: userId || '',
                hasAlmaConversation: 'true',
                basePrice: normalizedBasePrice.toString(),
                totalPaid: normalizedTotalPrice.toString(),
            };
        } else {
            // Legacy flow (existing memorial creation)
            if (!Array.isArray(items) || items.length === 0) {
                return NextResponse.json({ error: 'No items' }, { status: 400 });
            }

            lineItems = items.map((item: any) => ({
                price_data: {
                    currency: 'eur',
                    product_data: { name: item.name },
                    unit_amount: toAmountInCents(item.amount),
                },
                quantity: 1,
            }));

            const legacyTotal = items.reduce((sum: number, item: any) => sum + toAmountInCents(item.amount), 0) / 100;

            successUrl = buildUrlWithParams('/create/confirmation', {
                session_id: '{CHECKOUT_SESSION_ID}',
                memory_id: normalizedMemoryId,
            });
            cancelUrl = buildUrlWithParams('/create/pay', {
                memoryId: normalizedMemoryId,
                error: 'cancelled',
            });

            metadata = {
                memoryId: normalizedMemoryId,
                memorialId: normalizedMemoryId,
                packId: packId || '',
                type: 'memorial_creation',
                totalPaid: legacyTotal.toString(),
            };
        }

        const stripe = getStripeServerClient();

        if (!stripe) {
            if (!isMockPaymentsEnabled()) {
                return NextResponse.json(
                    { error: 'Stripe is not configured. Set STRIPE_SECRET_KEY or enable ALLOW_MOCK_PAYMENTS for local testing.' },
                    { status: 503 }
                );
            }

            const mockSessionId = buildMockSessionId(normalizedMemoryId);
            return NextResponse.json({
                url: buildUrlWithParams(isAlmaRequest ? (returnUrl || '/alma/confirmation') : '/create/confirmation', {
                    session_id: mockSessionId,
                    memory_id: normalizedMemoryId,
                    memorial_id: normalizedMemoryId,
                }),
            });
        }

        // Create Checkout Session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: lineItems,
            mode: 'payment',
            success_url: successUrl,
            cancel_url: cancelUrl,
            customer_email: typeof email === 'string' && email.trim() ? email.trim() : undefined,
            client_reference_id: normalizedMemoryId,
            metadata,
        });

        return NextResponse.json({ url: session.url });
    } catch (err: any) {
        console.error('Stripe Session Error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
