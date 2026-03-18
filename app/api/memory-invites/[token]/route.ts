import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/app/api/user-dashboard/_shared';
import { getSupabaseAdmin } from '@/lib/server/supabaseAdmin';
import {

  appendMemoryActivityLog,
  normalizeInviteStatus,
  resolveMemoryDisplayName,
} from '@/lib/server/memoryCollaboration';

export const runtime = 'nodejs';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const inviteToken = String(token || '').trim();
    if (!inviteToken) return NextResponse.json({ error: 'Missing token' }, { status: 400 });

    const admin = getSupabaseAdmin();
    const { data: invite } = await admin
      .from('memory_invites')
      .select('id, memory_id, email, role, status, access_code, expires_at, claimed_at, claimed_by_user_id, token')
      .eq('token', inviteToken)
      .maybeSingle();

    if (!invite) return NextResponse.json({ error: 'Invite not found' }, { status: 404 });

    const status = normalizeInviteStatus(invite.status);
    const expired = status === 'expired' || new Date(invite.expires_at) < new Date();
    if (expired && status === 'pending') {
      await admin
        .from('memory_invites')
        .update({ status: 'expired', updated_at: new Date().toISOString() })
        .eq('id', invite.id);
    }

    const { data: memory } = await admin
      .from('memories')
      .select('id, data, firstname, lastname')
      .eq('id', invite.memory_id)
      .single();

    return NextResponse.json({
      invite: {
        id: invite.id,
        email: invite.email,
        role: invite.role,
        status: expired ? 'expired' : status,
        accessCode: invite.access_code,
        expiresAt: invite.expires_at,
        claimedAt: invite.claimed_at,
        claimedByUserId: invite.claimed_by_user_id,
      },
      memory: memory
        ? {
            id: memory.id,
            title: resolveMemoryDisplayName(memory),
          }
        : null,
    });
  } catch (error) {
    console.error('MEMORY INVITE GET error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { user } = await getAuthenticatedUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { token } = await params;
    const inviteToken = String(token || '').trim();
    if (!inviteToken) return NextResponse.json({ error: 'Missing token' }, { status: 400 });

    const admin = getSupabaseAdmin();
    const { data: invite } = await admin
      .from('memory_invites')
      .select('id, memory_id, email, role, status, access_code, expires_at, claimed_by_user_id, invited_by_user_id, created_at')
      .eq('token', inviteToken)
      .maybeSingle();

    if (!invite) return NextResponse.json({ error: 'Invite not found' }, { status: 404 });

    const inviteExpired = new Date(invite.expires_at) < new Date();
    if (inviteExpired || invite.status === 'expired' || invite.status === 'revoked') {
      return NextResponse.json({ error: 'Invite expired' }, { status: 410 });
    }

    const userEmail = String(user.email || '').trim().toLowerCase();
    if (!userEmail || userEmail !== invite.email) {
      return NextResponse.json(
        { error: `Cette invitation est reservee a ${invite.email}.` },
        { status: 403 }
      );
    }

    const now = new Date().toISOString();

    const { data: existingMembership } = await admin
      .from('memory_memberships')
      .select('id, invited_at')
      .eq('memory_id', invite.memory_id)
      .eq('email', invite.email)
      .maybeSingle();

    await admin
      .from('memory_memberships')
      .upsert({
        memory_id: invite.memory_id,
        user_id: user.id,
        email: invite.email,
        role: invite.role,
        status: 'active',
        invited_at: existingMembership?.invited_at || invite.created_at || now,
        invited_by_user_id: invite.invited_by_user_id || null,
        joined_at: now,
        last_seen_at: now,
        updated_at: now,
      }, { onConflict: 'memory_id,email' });

    await admin
      .from('memory_invites')
      .update({
        status: 'claimed',
        claimed_by_user_id: user.id,
        claimed_at: now,
        updated_at: now,
      })
      .eq('id', invite.id);

    await appendMemoryActivityLog(admin, {
      memoryId: invite.memory_id,
      actorUserId: user.id,
      actorEmail: user.email || null,
      actorRole: invite.role,
      source: 'invite_link',
      action: 'invite_claimed',
      targetType: 'memory_invite',
      targetId: invite.id,
      metadata: {
        accessCode: invite.access_code,
      },
    });

    return NextResponse.json({
      success: true,
      memoryId: invite.memory_id,
      role: invite.role,
    });
  } catch (error) {
    console.error('MEMORY INVITE POST error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
