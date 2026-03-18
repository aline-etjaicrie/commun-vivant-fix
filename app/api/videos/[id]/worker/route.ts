import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';


const ALLOWED_STATUS = new Set(['queued', 'rendering', 'completed', 'failed']);

function getServiceClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const workerSecret = process.env.VIDEO_WORKER_SECRET;
    const provided = request.headers.get('x-video-worker-secret');
    if (!workerSecret || provided !== workerSecret) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await context.params;
    if (!id) return NextResponse.json({ error: 'Missing video id' }, { status: 400 });

    const body = await request.json();
    const status = String(body?.status || '');
    const progress = Number(body?.progress ?? 0);
    const videoStoragePath = body?.video_storage_path ? String(body.video_storage_path) : null;
    const failureReason = body?.failure_reason ? String(body.failure_reason) : null;

    if (!ALLOWED_STATUS.has(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const updatePayload: Record<string, any> = {
      status,
      progress: Math.max(0, Math.min(100, Number.isFinite(progress) ? progress : 0)),
      failure_reason: failureReason,
    };

    if (videoStoragePath) {
      updatePayload.video_storage_path = videoStoragePath;
    }

    const supabase = getServiceClient();
    const { data, error } = await supabase
      .from('memory_videos')
      .update(updatePayload)
      .eq('id', id)
      .select('id, status, progress, video_storage_path, failure_reason')
      .single();

    if (error || !data) {
      return NextResponse.json({ error: 'Update failed' }, { status: 500 });
    }

    return NextResponse.json({ video: data });
  } catch (error) {
    console.error('VIDEO worker patch error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

