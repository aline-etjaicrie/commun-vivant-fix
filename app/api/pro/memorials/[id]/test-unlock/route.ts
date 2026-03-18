import { NextRequest, NextResponse } from 'next/server';
import { getProContext, isWriteRole } from '@/app/api/pro/_shared';

export const runtime = 'nodejs';


export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const ctx = await getProContext(request);
    if (!ctx) return NextResponse.json({ error: 'Unauthorized pro access' }, { status: 401 });
    if (!isWriteRole(ctx.membership.role)) {
      return NextResponse.json({ error: 'Write role required' }, { status: 403 });
    }

    const { id } = await params;
    const memoryId = String(id || '');
    if (!memoryId) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

    const { data: memory, error: readError } = await (ctx.supabase as any)
      .from('memories')
      .select('id, agency_id')
      .eq('id', memoryId)
      .single();

    if (readError || !memory) {
      return NextResponse.json({ error: 'Memorial not found' }, { status: 404 });
    }

    if (memory.agency_id !== ctx.membership.agency_id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { error: updateError } = await (ctx.supabase as any)
      .from('memories')
      .update({
        payment_status: 'paid',
        updated_at: new Date().toISOString(),
      })
      .eq('id', memoryId);

    if (updateError) {
      console.error('PRO memorial test unlock error:', updateError);
      return NextResponse.json({ error: 'Unable to unlock memorial' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('PRO memorial test unlock server error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
