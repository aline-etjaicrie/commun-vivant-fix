import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/app/api/user-dashboard/_shared';
import { type CommunType, getLegacyContextForCommunType } from '@/lib/communTypes';
import { generateUuid, isUuid } from '@/lib/ids';
import { resolveIdentity } from '@/lib/memorialRuntime';
import { createDraftAccessToken } from '@/lib/server/draftAccessToken';
import {

  getSupabaseAdmin,
  isMissingSupabaseAdminEnvironmentError,
} from '@/lib/server/supabaseAdmin';

export const runtime = 'nodejs';

function normalizeCommunType(value: unknown): CommunType {
  if (
    value === 'deces' ||
    value === 'hommage-vivant' ||
    value === 'transmission-familiale' ||
    value === 'memoire-objet' ||
    value === 'pro-ceremonie'
  ) {
    return value;
  }
  return 'deces';
}

function normalizeContext(value: unknown, communType: CommunType): string {
  if (typeof value === 'string' && value.trim()) {
    return value.trim();
  }
  return getLegacyContextForCommunType(communType);
}

function buildMemoryData(params: {
  questionnaire: any;
  finalization: any;
  media: any;
  context: string;
  communType: CommunType;
}) {
  const { questionnaire, finalization, media, context, communType } = params;
  const identity = resolveIdentity(questionnaire || finalization || {});
  const safeMedia = media && typeof media === 'object' ? media : null;
  const imageThemes = Array.isArray(safeMedia?.imageThemes)
    ? safeMedia.imageThemes.map((value: unknown) => String(value || '').trim()).filter(Boolean).slice(0, 20)
    : [];

  return {
    ...(questionnaire && typeof questionnaire === 'object' ? questionnaire : {}),
    ...(finalization && typeof finalization === 'object' ? finalization : {}),
    ...(safeMedia ? { medias: safeMedia } : {}),
    ...(imageThemes.length > 0 ? { imageThemes, memoryImageEnergies: imageThemes } : {}),
    identite: {
      ...(questionnaire?.identite || {}),
      prenom: identity?.prenom || '',
      nom: identity?.nom || '',
    },
    context,
    communType,
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    const requestedMemoryId = typeof body?.memoryId === 'string' ? body.memoryId.trim() : '';
    const memoryId = isUuid(requestedMemoryId) ? requestedMemoryId : generateUuid();
    const communType = normalizeCommunType(body?.communType || body?.finalization?.communType);
    const context = normalizeContext(body?.context || body?.finalization?.context, communType);
    const questionnaire = body?.questionnaire ?? null;
    const finalization = body?.finalization ?? null;
    const media = body?.media ?? null;
    const admin = getSupabaseAdmin();
    const { user } = await getAuthenticatedUser(request);

    const { data: existingMemory, error: lookupError } = await admin
      .from('memories')
      .select('id, user_id, owner_user_id, data, context, created_by')
      .eq('id', memoryId)
      .maybeSingle();

    if (lookupError) {
      throw lookupError;
    }

    const nextData = buildMemoryData({ questionnaire, finalization, media, context, communType });

    if (existingMemory) {
      const existingOwnerId = existingMemory.owner_user_id || existingMemory.user_id || null;

      if (existingOwnerId && (!user || user.id !== existingOwnerId)) {
        return NextResponse.json(
          { error: 'Ce brouillon appartient deja a un autre compte.' },
          { status: 403 }
        );
      }

      const shouldReplaceNarrativeData = Boolean(questionnaire || finalization);
      const updatePayload: Record<string, unknown> = {
        context,
        data: shouldReplaceNarrativeData
          ? nextData
          : {
              ...(existingMemory.data && typeof existingMemory.data === 'object' ? existingMemory.data : {}),
              ...nextData,
            },
      };

      if (user && !existingOwnerId) {
        updatePayload.user_id = user.id;
        updatePayload.owner_user_id = user.id;
        updatePayload.created_by = 'user';
      }

      const { error: updateError } = await admin.from('memories').update(updatePayload).eq('id', memoryId);
      if (updateError) throw updateError;
    } else {
      const { error: insertError } = await admin.from('memories').insert({
        id: memoryId,
        user_id: user?.id || null,
        owner_user_id: user?.id || null,
        context,
        generation_status: 'not_started',
        publication_status: 'draft',
        payment_status: 'pending',
        status: 'draft',
        created_by: user ? 'user' : 'guest',
        data: nextData,
      });

      if (insertError) throw insertError;
    }

    return NextResponse.json({
      memoryId,
      draftToken: createDraftAccessToken(memoryId),
    });
  } catch (error: any) {
    console.error('Ensure draft memory error:', error);

    if (isMissingSupabaseAdminEnvironmentError(error)) {
      return NextResponse.json(
        {
          error:
            "La preproduction n'est pas encore completement configuree. Il manque une variable serveur Supabase.",
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: error?.message || 'Impossible de preparer ce brouillon' },
      { status: 500 }
    );
  }
}
