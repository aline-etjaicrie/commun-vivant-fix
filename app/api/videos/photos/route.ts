import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/app/api/user-dashboard/_shared';
import {
  getMemoryAccessProfile,
  hasAdministrativeMemoryRole,
} from '@/lib/server/memoryCollaboration';
import { getSupabaseAdmin } from '@/lib/server/supabaseAdmin';

export const runtime = 'nodejs';


export async function GET(request: NextRequest) {
  try {
    const { user } = await getAuthenticatedUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const memoryId = request.nextUrl.searchParams.get('memory_id');
    if (!memoryId) return NextResponse.json({ error: 'memory_id manquant' }, { status: 400 });

    const admin = getSupabaseAdmin();
    const accessProfile = await getMemoryAccessProfile(admin, memoryId, user.id);
    const memory = accessProfile.memory;

    if (!memory) {
      return NextResponse.json({ error: 'Memorial introuvable' }, { status: 404 });
    }
    if (!hasAdministrativeMemoryRole(accessProfile.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { data, error } = await admin
      .from('memory_media')
      .select('id, type')
      .eq('memory_id', memoryId)
      .order('id', { ascending: true })
      .limit(120);

    if (error) {
      return NextResponse.json({ error: 'Unable to load photos' }, { status: 500 });
    }

    const photoIds = (data || [])
      .filter((row: any) => !row.type || row.type === 'image')
      .map((row: any) => String(row.id));

    return NextResponse.json({ memory_id: memoryId, photo_ids: photoIds });
  } catch (error) {
    console.error('VIDEO photos error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
