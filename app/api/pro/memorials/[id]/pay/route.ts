import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';


export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  await context.params;
  await request.json().catch(() => null);
  return NextResponse.json(
    { error: 'Deprecated endpoint. Commission accounting must be driven by Stripe webhook.' },
    { status: 410 }
  );
}
