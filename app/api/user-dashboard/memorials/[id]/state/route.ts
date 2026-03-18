import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/app/api/user-dashboard/_shared';
import { resolveMemoryPublicUrl } from '@/lib/memoryPublication';
import { normalizePublicUrlOrPath } from '@/lib/publicUrls';
import {
  appendMemoryActivityLog,
  getMemoryAccessProfile,
  hasAdministrativeMemoryRole,
} from '@/lib/server/memoryCollaboration';
import { getSupabaseAdmin } from '@/lib/server/supabaseAdmin';

export const runtime = 'nodejs';


const ALLOWED_PUBLICATION_STATUS = new Set(['draft', 'published', 'archived']);

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user } = await getAuthenticatedUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const memoryId = String(id || '');
    const body = await request.json();
    const publicationStatus = String(body?.publicationStatus || '');

    if (!memoryId || !ALLOWED_PUBLICATION_STATUS.has(publicationStatus)) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const admin = getSupabaseAdmin();
    const accessProfile = await getMemoryAccessProfile(admin, memoryId, user.id);
    const memory = accessProfile.memory;

    if (!memory) {
      return NextResponse.json({ error: 'Memorial not found' }, { status: 404 });
    }

    if (!hasAdministrativeMemoryRole(accessProfile.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const updatePayload: Record<string, any> = {
      publication_status: publicationStatus,
      updated_at: new Date().toISOString(),
    };

    if (publicationStatus === 'published') {
      const resolved = await resolveMemoryPublicUrl(admin, memory, memory.agency_id ? 'b2b' : 'b2c');
      updatePayload.slug = resolved.slug;
      updatePayload.public_url = resolved.publicUrl;
    }

    const responsePublicUrl = normalizePublicUrlOrPath(
      updatePayload.public_url || memory.public_url || null,
      `/${updatePayload.slug || memory.slug || memoryId}`
    );

    const { error: updateError } = await admin
      .from('memories')
      .update(updatePayload)
      .eq('id', memoryId);

    if (updateError) {
      console.error('USER DASH memorial state update error:', updateError);
      return NextResponse.json({ error: 'Unable to update memorial state' }, { status: 500 });
    }

    await appendMemoryActivityLog(admin, {
      memoryId,
      actorUserId: user.id,
      actorEmail: user.email || null,
      actorRole: accessProfile.role,
      source: 'dashboard',
      action: 'publication_state_changed',
      targetType: 'memory',
      targetId: memoryId,
      metadata: {
        publicationStatus,
        publicUrl: responsePublicUrl,
      },
    });

    return NextResponse.json({
      success: true,
      publicUrl: responsePublicUrl,
    });
  } catch (error) {
    console.error('USER DASH memorial state server error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
