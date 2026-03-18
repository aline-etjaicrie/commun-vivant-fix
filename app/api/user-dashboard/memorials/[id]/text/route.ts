import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/app/api/user-dashboard/_shared';
import {
  appendMemoryActivityLog,
  getMemoryAccessProfile,
  hasAdministrativeMemoryRole,
  resolveMemoryDisplayName,
} from '@/lib/server/memoryCollaboration';
import { appendMemoryTextVersion, listMemoryTextVersions } from '@/lib/server/memoryTextVersions';
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
    const memoryId = String(id || '').trim();
    if (!memoryId) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

    const admin = getSupabaseAdmin();
    const accessProfile = await getMemoryAccessProfile(admin, memoryId, user.id);
    const memory = accessProfile.memory;
    if (!memory || !accessProfile.role) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { data: fullMemory, error } = await admin
      .from('memories')
      .select('id, data, firstname, lastname, bio, style, generated_text_original, generated_text_edited, text_manually_edited, regeneration_count, regeneration_limit')
      .eq('id', memoryId)
      .single();

    if (error || !fullMemory) {
      return NextResponse.json({ error: 'Memorial not found' }, { status: 404 });
    }

    const versions = await listMemoryTextVersions(admin, memoryId, 12);

    return NextResponse.json({
      memory: {
        id: fullMemory.id,
        title: resolveMemoryDisplayName(fullMemory),
        bio: fullMemory.bio || '',
        style: fullMemory.style || 'narratif',
        generatedTextOriginal: fullMemory.generated_text_original || '',
        generatedTextEdited: fullMemory.generated_text_edited || '',
        textManuallyEdited: Boolean(fullMemory.text_manually_edited),
        regenerationCount: Number(fullMemory.regeneration_count || 0),
        regenerationLimit: Number(fullMemory.regeneration_limit || 3),
      },
      access: {
        role: accessProfile.role,
        canEdit: hasAdministrativeMemoryRole(accessProfile.role),
      },
      versions,
    });
  } catch (error) {
    console.error('USER DASH text GET error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user } = await getAuthenticatedUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const memoryId = String(id || '').trim();
    if (!memoryId) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

    const admin = getSupabaseAdmin();
    const accessProfile = await getMemoryAccessProfile(admin, memoryId, user.id);
    if (!accessProfile.memory) {
      return NextResponse.json({ error: 'Memorial not found' }, { status: 404 });
    }
    if (!hasAdministrativeMemoryRole(accessProfile.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const textHtml = String(body?.textHtml || '').trim();
    const textPlain = String(body?.textPlain || '').trim();
    const style = String(body?.style || '').trim() || null;

    if (!textHtml && !textPlain) {
      return NextResponse.json({ error: 'Texte manquant' }, { status: 400 });
    }

    const { error: updateError } = await admin
      .from('memories')
      .update({
        generated_text_edited: textHtml || null,
        bio: textPlain || null,
        text_manually_edited: true,
        style,
        updated_at: new Date().toISOString(),
      })
      .eq('id', memoryId);

    if (updateError) {
      console.error('USER DASH text update error:', updateError);
      return NextResponse.json({ error: 'Unable to save text' }, { status: 500 });
    }

    await appendMemoryTextVersion(admin, {
      memoryId,
      createdByUserId: user.id,
      createdByEmail: user.email || null,
      actorRole: accessProfile.role,
      source: 'dashboard_text_editor',
      versionKind: 'manual_edit',
      style,
      contentText: textPlain,
      contentHtml: textHtml,
    });

    await appendMemoryActivityLog(admin, {
      memoryId,
      actorUserId: user.id,
      actorEmail: user.email || null,
      actorRole: accessProfile.role,
      source: 'dashboard',
      action: 'text_version_saved',
      targetType: 'memory',
      targetId: memoryId,
      metadata: {
        style,
        manual: true,
      },
    });

    const versions = await listMemoryTextVersions(admin, memoryId, 12);

    return NextResponse.json({
      success: true,
      versions,
    });
  } catch (error) {
    console.error('USER DASH text PATCH error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
