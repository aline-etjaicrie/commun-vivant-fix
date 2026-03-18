import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/app/api/user-dashboard/_shared';
import {
  appendMemoryActivityLog,
  getMemoryAccessProfile,
  hasAdministrativeMemoryRole,
} from '@/lib/server/memoryCollaboration';
import { getSupabaseAdmin } from '@/lib/server/supabaseAdmin';

export const runtime = 'nodejs';


function sanitizeEnergies(input: unknown): string[] {
  if (!Array.isArray(input)) return [];
  return input
    .map((value) => String(value || '').trim())
    .filter(Boolean)
    .map((value) => value.slice(0, 60))
    .slice(0, 20);
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { user } = await getAuthenticatedUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await context.params;
    if (!id) return NextResponse.json({ error: 'Missing memorial id' }, { status: 400 });

    const body = await request.json();
    const energies = sanitizeEnergies(body?.energies);

    const admin = getSupabaseAdmin();
    const accessProfile = await getMemoryAccessProfile(admin, id, user.id);
    if (!accessProfile.memory) {
      return NextResponse.json({ error: 'Memorial not found' }, { status: 404 });
    }
    if (!hasAdministrativeMemoryRole(accessProfile.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { data, error } = await admin
      .from('memories')
      .update({
        memory_image_energies: energies,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select('id, memory_image_energies')
      .single();

    if (error || !data) {
      return NextResponse.json({ error: 'Unable to save image energies' }, { status: 500 });
    }

    await appendMemoryActivityLog(admin, {
      memoryId: id,
      actorUserId: user.id,
      actorEmail: user.email || null,
      actorRole: accessProfile.role,
      source: 'dashboard',
      action: 'image_energies_updated',
      targetType: 'memory',
      targetId: id,
      metadata: {
        energies,
      },
    });

    return NextResponse.json({ memorial: data });
  } catch (error) {
    console.error('USER DASH image energies error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
