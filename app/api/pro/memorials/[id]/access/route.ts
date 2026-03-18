import { NextRequest, NextResponse } from 'next/server';
import { getProContext, isWriteRole } from '@/app/api/pro/_shared';

export const runtime = 'nodejs';


const ALLOWED_ACCESS_STATUS = new Set(['active', 'suspended']);

export async function PATCH(
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
    const body = await request.json();
    const accessStatus = String(body?.accessStatus || '');
    const suspensionReason =
      typeof body?.suspensionReason === 'string' && body.suspensionReason.trim().length > 0
        ? body.suspensionReason.trim()
        : null;

    if (!memoryId || !ALLOWED_ACCESS_STATUS.has(accessStatus)) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

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

    const patch =
      accessStatus === 'suspended'
        ? {
            access_status: 'suspended',
            suspended_at: new Date().toISOString(),
            suspension_reason: suspensionReason,
            updated_at: new Date().toISOString(),
          }
        : {
            access_status: 'active',
            suspended_at: null,
            suspension_reason: null,
            updated_at: new Date().toISOString(),
          };

    const { error: updateError } = await (ctx.supabase as any)
      .from('memories')
      .update(patch)
      .eq('id', memoryId);

    if (updateError) {
      console.error('PRO memorial access update error:', updateError);
      return NextResponse.json({ error: 'Unable to update memorial access' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('PRO memorial access server error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
