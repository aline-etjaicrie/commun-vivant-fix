import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/app/api/user-dashboard/_shared';
import {
  appendMemoryActivityLog,
  getMemoryAccessProfile,
  hasAdministrativeMemoryRole,
} from '@/lib/server/memoryCollaboration';
import { getSupabaseAdmin } from '@/lib/server/supabaseAdmin';

export const runtime = 'nodejs';


async function fetchMessagesForMemory(admin: any, memoryId: string) {
  const primary = await admin
    .from('memory_messages')
    .select('id, memory_id, author_name, content, created_at, approved, flagged, flagged_reason, status')
    .eq('memory_id', memoryId)
    .order('created_at', { ascending: false });

  if (!primary.error) return { table: 'memory_messages', rows: primary.data || [] };

  const fallback = await admin
    .from('messages')
    .select('id, memory_id, author_name, content, created_at, approved, flagged, flagged_reason, status')
    .eq('memory_id', memoryId)
    .order('created_at', { ascending: false });

  return { table: 'messages', rows: fallback.data || [] };
}

async function resolveMessageContext(admin: any, messageId: string) {
  const primary = await admin
    .from('memory_messages')
    .select('id, memory_id')
    .eq('id', messageId)
    .maybeSingle();

  if (!primary.error && primary.data) {
    return { table: 'memory_messages', memoryId: primary.data.memory_id };
  }

  const fallback = await admin
    .from('messages')
    .select('id, memory_id')
    .eq('id', messageId)
    .maybeSingle();

  if (!fallback.error && fallback.data) {
    return { table: 'messages', memoryId: fallback.data.memory_id };
  }

  return { table: null, memoryId: null };
}

export async function GET(request: NextRequest) {
  try {
    const { user } = await getAuthenticatedUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const memoryId = String(request.nextUrl.searchParams.get('memoryId') || '').trim();
    if (!memoryId) return NextResponse.json({ error: 'memoryId manquant' }, { status: 400 });

    const admin = getSupabaseAdmin();
    const accessProfile = await getMemoryAccessProfile(admin, memoryId, user.id);
    if (!accessProfile.memory) return NextResponse.json({ error: 'Memorial not found' }, { status: 404 });
    if (!hasAdministrativeMemoryRole(accessProfile.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const context = await fetchMessagesForMemory(admin, memoryId);
    return NextResponse.json({
      messages: context.rows,
      table: context.table,
      role: accessProfile.role,
    });
  } catch (error) {
    console.error('USER DASH messages GET error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { user } = await getAuthenticatedUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const id = String(body?.id || '');
    const status = String(body?.status || '');

    if (!id || !['approved', 'pending', 'flagged'].includes(status)) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const admin = getSupabaseAdmin();
    const context = await resolveMessageContext(admin, id);
    if (!context.table || !context.memoryId) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }

    const accessProfile = await getMemoryAccessProfile(admin, context.memoryId, user.id);
    if (!hasAdministrativeMemoryRole(accessProfile.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const payload = {
      status,
      approved: status === 'approved',
      flagged: status === 'flagged',
      moderated_at: new Date().toISOString(),
    };

    const { error } = await admin
      .from(context.table)
      .update(payload)
      .eq('id', id);

    if (error) {
      console.error('USER DASH message patch error:', error);
      return NextResponse.json({ error: 'Unable to update message' }, { status: 500 });
    }

    await appendMemoryActivityLog(admin, {
      memoryId: context.memoryId,
      actorUserId: user.id,
      actorEmail: user.email || null,
      actorRole: accessProfile.role,
      source: 'dashboard',
      action: 'message_moderated',
      targetType: 'memory_message',
      targetId: id,
      metadata: {
        status,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('USER DASH message patch server error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { user } = await getAuthenticatedUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const id = String(body?.id || '');
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

    const admin = getSupabaseAdmin();
    const context = await resolveMessageContext(admin, id);
    if (!context.table || !context.memoryId) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }

    const accessProfile = await getMemoryAccessProfile(admin, context.memoryId, user.id);
    if (!hasAdministrativeMemoryRole(accessProfile.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { error } = await admin
      .from(context.table)
      .delete()
      .eq('id', id);

    if (error) {
      console.error('USER DASH message delete error:', error);
      return NextResponse.json({ error: 'Unable to delete message' }, { status: 500 });
    }

    await appendMemoryActivityLog(admin, {
      memoryId: context.memoryId,
      actorUserId: user.id,
      actorEmail: user.email || null,
      actorRole: accessProfile.role,
      source: 'dashboard',
      action: 'message_deleted',
      targetType: 'memory_message',
      targetId: id,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('USER DASH message delete server error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
