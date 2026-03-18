import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/app/api/user-dashboard/_shared';
import {
  appendMemoryActivityLog,
  getMemoryAccessProfile,
  hasAdministrativeMemoryRole,
} from '@/lib/server/memoryCollaboration';
import { getSupabaseAdmin } from '@/lib/server/supabaseAdmin';

export const runtime = 'nodejs';


function normalizeThemes(input: unknown): string[] {
  if (!Array.isArray(input)) return [];
  return input
    .map((v) => String(v || '').trim())
    .filter(Boolean)
    .slice(0, 20);
}

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
    const themes = normalizeThemes(body?.themes);

    if (!memoryId) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    if (themes.length === 0) return NextResponse.json({ error: 'themes manquants' }, { status: 400 });

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
        image_themes: themes,
        memory_image_energies: themes,
        updated_at: new Date().toISOString(),
      })
      .eq('id', memoryId);

    if (updateError) {
      console.error('USER DASH image themes update error:', updateError);
      return NextResponse.json({ error: 'Unable to update themes' }, { status: 500 });
    }

    await appendMemoryActivityLog(admin, {
      memoryId,
      actorUserId: user.id,
      actorEmail: user.email || null,
      actorRole: accessProfile.role,
      source: 'dashboard',
      action: 'image_themes_updated',
      targetType: 'memory',
      targetId: memoryId,
      metadata: {
        themes,
      },
    });

    return NextResponse.json({ success: true, themes });
  } catch (error) {
    console.error('USER DASH image themes server error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
