import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/app/api/user-dashboard/_shared';
import {
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
    const { supabase, user } = await getAuthenticatedUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const videoId = String(id || '');
    if (!videoId) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

    const { data: video, error: videoError } = await (supabase as any)
      .from('memory_videos')
      .select('id, memory_id, status, progress, download_url, user_id')
      .eq('id', videoId)
      .single();

    if (videoError || !video) {
      return NextResponse.json({ error: 'Video introuvable' }, { status: 404 });
    }

    if (video.user_id && video.user_id !== user.id) {
      const admin = getSupabaseAdmin();
      const accessProfile = await getMemoryAccessProfile(admin, video.memory_id, user.id);
      if (!accessProfile.memory || !hasAdministrativeMemoryRole(accessProfile.role)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    return NextResponse.json({
      id: video.id,
      memory_id: video.memory_id,
      status: video.status || 'queued',
      progress: Number(video.progress || 0),
      download_url: video.download_url || null,
    });
  } catch (error) {
    console.error('VIDEO [id] get server error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
