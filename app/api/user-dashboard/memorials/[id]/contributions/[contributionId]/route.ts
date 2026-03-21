import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/app/api/user-dashboard/_shared';
import { getSupabaseAdmin } from '@/lib/server/supabaseAdmin';
import {
  appendMemoryActivityLog,
  canAdministerMemory,
} from '@/lib/server/memoryCollaboration';

export const runtime = 'nodejs';

const ALLOWED_STATUSES = ['reviewed', 'archived', 'refused'] as const;
type ModerationStatus = typeof ALLOWED_STATUSES[number];

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; contributionId: string }> }
) {
  try {
    const { user } = await getAuthenticatedUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id, contributionId } = await params;
    const memoryId = String(id || '');
    const contribId = String(contributionId || '');

    if (!memoryId || !contribId) {
      return NextResponse.json({ error: 'Missing params' }, { status: 400 });
    }

    const body = await request.json();
    const newStatus = String(body?.status || '') as ModerationStatus;

    if (!ALLOWED_STATUSES.includes(newStatus)) {
      return NextResponse.json(
        { error: `Statut invalide. Valeurs acceptées : ${ALLOWED_STATUSES.join(', ')}` },
        { status: 400 }
      );
    }

    const admin = getSupabaseAdmin();
    const accessGranted = await canAdministerMemory(admin, memoryId, user.id);
    if (!accessGranted) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { data: existing } = await admin
      .from('memory_contributions')
      .select('id, status, memory_id')
      .eq('id', contribId)
      .eq('memory_id', memoryId)
      .maybeSingle();

    if (!existing) return NextResponse.json({ error: 'Contribution not found' }, { status: 404 });

    const now = new Date().toISOString();
    const { error: updateError } = await admin
      .from('memory_contributions')
      .update({ status: newStatus, updated_at: now })
      .eq('id', contribId);

    if (updateError) {
      console.error('CONTRIBUTION PATCH error:', updateError);
      return NextResponse.json({ error: 'Unable to update contribution' }, { status: 500 });
    }

    await appendMemoryActivityLog(admin, {
      memoryId,
      actorUserId: user.id,
      actorEmail: user.email || null,
      actorRole: 'owner',
      source: 'dashboard',
      action: `contribution_${newStatus}`,
      targetType: 'memory_contribution',
      targetId: contribId,
      metadata: { previousStatus: existing.status, newStatus },
    });

    return NextResponse.json({ success: true, id: contribId, status: newStatus });
  } catch (error) {
    console.error('CONTRIBUTION PATCH server error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
