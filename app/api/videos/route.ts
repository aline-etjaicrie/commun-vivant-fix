import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/app/api/user-dashboard/_shared';
import {
  getMemoryAccessProfile,
  hasAdministrativeMemoryRole,
} from '@/lib/server/memoryCollaboration';
import { getSupabaseAdmin } from '@/lib/server/supabaseAdmin';
import { FAMILY_VIDEO_MAX_PHOTOS, isValidVideoTemplate, VIDEO_TEMPLATES } from '@/lib/video/templates';

export const runtime = 'nodejs';


interface CreateVideoBody {
  memory_id: string;
  template_id: string;
  music_id?: string | null;
  photo_ids: string[];
  image_urls?: string[];
  text_snippets?: string[];
}

function normalizeTextSnippets(input: unknown): string[] {
  if (!Array.isArray(input)) return [];
  return input.map((v) => String(v || '').trim()).filter(Boolean).slice(0, 12);
}

export async function POST(request: NextRequest) {
  try {
    const { user } = await getAuthenticatedUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = (await request.json()) as CreateVideoBody;
    const memoryId = String(body?.memory_id || '');
    const templateId = String(body?.template_id || '');
    const musicId = body?.music_id ? String(body.music_id) : null;
    const photoIds = Array.isArray(body?.photo_ids) ? body.photo_ids.map((id) => String(id)) : [];
    const imageUrls = Array.isArray(body?.image_urls) ? body.image_urls.map((url) => String(url)) : [];
    const textSnippets = normalizeTextSnippets(body?.text_snippets);

    if (!memoryId || !templateId) {
      return NextResponse.json({ error: 'memory_id et template_id requis' }, { status: 400 });
    }

    if (!isValidVideoTemplate(templateId)) {
      return NextResponse.json({ error: 'template_id invalide' }, { status: 400 });
    }

    if (photoIds.length === 0 && imageUrls.length === 0) {
      return NextResponse.json({ error: 'photo_ids ou image_urls requis' }, { status: 400 });
    }

    const allowedPhotos = Math.min(FAMILY_VIDEO_MAX_PHOTOS, VIDEO_TEMPLATES[templateId].maxPhotos);
    const requestedCount = imageUrls.length > 0 ? imageUrls.length : photoIds.length;
    if (requestedCount > allowedPhotos) {
      return NextResponse.json(
        {
          error: 'Limite de photos depassee',
          code: 'VIDEO_PHOTO_LIMIT',
          allowed_photos: allowedPhotos,
          received: requestedCount,
        },
        { status: 402 }
      );
    }

    const admin = getSupabaseAdmin();
    const accessProfile = await getMemoryAccessProfile(admin, memoryId, user.id);
    const memory = accessProfile.memory;

    if (!memory) {
      return NextResponse.json({ error: 'Memorial introuvable' }, { status: 404 });
    }
    if (!hasAdministrativeMemoryRole(accessProfile.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    let validPhotoIds: string[] = [];
    let validImageUrls: string[] = [];

    if (imageUrls.length > 0) {
      validImageUrls = imageUrls
        .map((url) => url.trim())
        .filter((url) => url.length > 0 && (url.startsWith('data:image/') || url.startsWith('https://')))
        .slice(0, allowedPhotos);

      if (validImageUrls.length !== imageUrls.length) {
        return NextResponse.json({ error: 'image_urls invalides' }, { status: 400 });
      }
    } else {
      const { data: mediaRows, error: mediaError } = await admin
        .from('memory_media')
        .select('id, memory_id, type')
        .eq('memory_id', memoryId)
        .in('id', photoIds);

      if (mediaError) {
        return NextResponse.json({ error: 'Verification medias impossible' }, { status: 500 });
      }

      validPhotoIds = (mediaRows || [])
        .filter((row: any) => row.memory_id === memoryId && (!row.type || row.type === 'image'))
        .map((row: any) => String(row.id));

      if (validPhotoIds.length !== photoIds.length) {
        return NextResponse.json({ error: 'photo_ids invalides pour ce memorial' }, { status: 400 });
      }
    }

    const finalPhotoCount = validImageUrls.length > 0 ? validImageUrls.length : validPhotoIds.length;
    const estimatedDurationSeconds = Math.ceil(
      finalPhotoCount * VIDEO_TEMPLATES[templateId].photoDurationSeconds +
        (textSnippets.length > 0 ? textSnippets.length * 2 : 0)
    );

    const { data: video, error: insertError } = await admin
      .from('memory_videos')
      .insert({
        memory_id: memoryId,
        user_id: user.id,
        template_id: templateId,
        music_id: musicId,
        photo_count_used: finalPhotoCount,
        duration_seconds: estimatedDurationSeconds,
        status: 'queued',
        progress: 0,
        text_snippets: textSnippets,
        photo_ids: validImageUrls.length > 0 ? validImageUrls : validPhotoIds,
      })
      .select('id, memory_id, template_id, status, progress, photo_count_used, duration_seconds, created_at')
      .single();

    if (insertError || !video) {
      console.error('VIDEO create error:', insertError);
      return NextResponse.json({ error: 'Creation video impossible' }, { status: 500 });
    }

    return NextResponse.json({
      video,
      render: {
        mode: 'asynchronous',
        worker_required: true,
      },
    });
  } catch (error) {
    console.error('VIDEO POST server error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
