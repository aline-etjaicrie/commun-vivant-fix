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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user } = await getAuthenticatedUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const memoryId = String(id || '');

    const admin = getSupabaseAdmin();
    const accessProfile = await getMemoryAccessProfile(admin, memoryId, user.id);
    const memory = accessProfile.memory;

    if (!memory) {
      return NextResponse.json({ error: 'Memorial not found' }, { status: 404 });
    }

    return NextResponse.json({
      accessLevel: memory.access_level ?? 'ouvert',
      publicationStatus: memory.publication_status ?? 'draft',
    });
  } catch (error) {
    console.error('USER DASH memorial state GET error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

const ALLOWED_PUBLICATION_STATUS = new Set(['draft', 'published', 'archived']);
const ALLOWED_ACCESS_LEVEL = new Set(['ouvert', 'restreint', 'a_definir_plus_tard']);

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
    const accessLevel = body?.accessLevel ? String(body.accessLevel) : null;

    if (!memoryId || !ALLOWED_PUBLICATION_STATUS.has(publicationStatus)) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    if (accessLevel !== null && !ALLOWED_ACCESS_LEVEL.has(accessLevel)) {
      return NextResponse.json({ error: 'Invalid accessLevel' }, { status: 400 });
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

    if (accessLevel !== null) {
      updatePayload.access_level = accessLevel;
    }

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
        accessLevel: accessLevel ?? undefined,
        publicUrl: responsePublicUrl,
      },
    });

    return NextResponse.json({
      success: true,
      publicUrl: responsePublicUrl,
      accessLevel: updatePayload.access_level ?? memory.access_level ?? 'a_definir_plus_tard',
    });
  } catch (error) {
    console.error('USER DASH memorial state server error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
