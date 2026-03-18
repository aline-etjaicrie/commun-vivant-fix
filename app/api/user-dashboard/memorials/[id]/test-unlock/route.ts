import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/app/api/user-dashboard/_shared';
import {
  appendMemoryActivityLog,
  getMemoryAccessProfile,
  hasAdministrativeMemoryRole,
} from '@/lib/server/memoryCollaboration';
import { getSupabaseAdmin } from '@/lib/server/supabaseAdmin';

export const runtime = 'nodejs';


export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
  ) {
  try {
    const { user } = await getAuthenticatedUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const memoryId = String(id || '');
    if (!memoryId) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

    const admin = getSupabaseAdmin();
    const accessProfile = await getMemoryAccessProfile(admin, memoryId, user.id);
    const memory = accessProfile.memory;

    if (!memory) {
      return NextResponse.json({ error: 'Memorial not found' }, { status: 404 });
    }

    if (!hasAdministrativeMemoryRole(accessProfile.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { error: updateError } = await admin
      .from('memories')
      .update({
        payment_status: 'paid',
        updated_at: new Date().toISOString(),
      })
      .eq('id', memoryId);

    if (updateError) {
      console.error('USER DASH test unlock error:', updateError);
      return NextResponse.json({ error: 'Unable to unlock memorial' }, { status: 500 });
    }

    await appendMemoryActivityLog(admin, {
      memoryId,
      actorUserId: user.id,
      actorEmail: user.email || null,
      actorRole: accessProfile.role,
      source: 'dashboard',
      action: 'test_unlock_granted',
      targetType: 'memory',
      targetId: memoryId,
      metadata: {
        paymentStatus: 'paid',
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('USER DASH test unlock server error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
