import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/app/api/user-dashboard/_shared';
import { getSupabaseAdmin } from '@/lib/server/supabaseAdmin';
import { sendMemoryInviteEmail } from '@/lib/server/memoryInviteEmails';
import {

  appendMemoryActivityLog,
  canAdministerMemory,
  generateInviteAccessCode,
  generateInviteToken,
  normalizeCollaboratorRole,
  normalizeContributorEmail,
  resolveMemoryDisplayName,
} from '@/lib/server/memoryCollaboration';

export const runtime = 'nodejs';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user } = await getAuthenticatedUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const memoryId = String(id || '');
    if (!memoryId) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

    const admin = getSupabaseAdmin();
    const accessGranted = await canAdministerMemory(admin, memoryId, user.id);
    if (!accessGranted) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { data: memory } = await admin
      .from('memories')
      .select('id, data, firstname, lastname, user_id, owner_user_id, agency_id, created_at')
      .eq('id', memoryId)
      .single();

    if (!memory) return NextResponse.json({ error: 'Memorial not found' }, { status: 404 });

    const [membershipsRes, invitesRes, contributionsRes, activityRes] = await Promise.all([
      admin
        .from('memory_memberships')
        .select('id, email, user_id, role, status, invited_at, joined_at, last_seen_at')
        .eq('memory_id', memoryId)
        .order('invited_at', { ascending: false }),
      admin
        .from('memory_invites')
        .select('id, email, role, status, token, access_code, expires_at, claimed_at, created_at')
        .eq('memory_id', memoryId)
        .order('created_at', { ascending: false }),
      admin
        .from('memory_contributions')
        .select('id, author_name, author_email, relationship_label, content, status, source, created_at, invite_id')
        .eq('memory_id', memoryId)
        .order('created_at', { ascending: false }),
      admin
        .from('memory_activity_logs')
        .select('id, actor_email, actor_role, source, action, target_type, target_id, metadata, created_at')
        .eq('memory_id', memoryId)
        .order('created_at', { ascending: false })
        .limit(20),
    ]);

    const contributionCountByEmail = new Map<string, number>();
    for (const contribution of contributionsRes.data || []) {
      const email = normalizeContributorEmail(contribution.author_email);
      if (!email) continue;
      contributionCountByEmail.set(email, (contributionCountByEmail.get(email) || 0) + 1);
    }

    const baseInviteUrl = `${request.nextUrl.origin}/invite`;

    const memberships = (membershipsRes.data || []).map((membership: any) => ({
      id: membership.id,
      email: membership.email,
      role: membership.role,
      status: membership.status,
      invitedAt: membership.invited_at,
      joinedAt: membership.joined_at,
      lastSeenAt: membership.last_seen_at,
      contributionCount: contributionCountByEmail.get(normalizeContributorEmail(membership.email)) || 0,
    }));

    const invites = (invitesRes.data || []).map((invite: any) => ({
      id: invite.id,
      email: invite.email,
      role: invite.role,
      status: invite.status,
      accessCode: invite.access_code,
      expiresAt: invite.expires_at,
      claimedAt: invite.claimed_at,
      createdAt: invite.created_at,
      inviteUrl: `${baseInviteUrl}/${invite.token}`,
      qrDownloadUrl: `${request.nextUrl.origin}/api/memory-invites/${invite.token}/qr`,
      contributionCount: contributionCountByEmail.get(normalizeContributorEmail(invite.email)) || 0,
    }));

    let creatorEmail = user.email || '';
    const creatorId = memory.owner_user_id || memory.user_id || null;
    if (creatorId && creatorId !== user.id) {
      const ownerResponse = await admin.auth.admin.getUserById(creatorId);
      creatorEmail = ownerResponse.data.user?.email || creatorEmail;
    }

    const contributions = (contributionsRes.data || []).map((c: any) => ({
      id: c.id,
      authorName: c.author_name || null,
      authorEmail: c.author_email || null,
      relationship: c.relationship_label || null,
      content: c.content,
      status: c.status,
      source: c.source,
      createdAt: c.created_at,
    }));

    return NextResponse.json({
      memory: {
        id: memory.id,
        title: resolveMemoryDisplayName(memory),
      },
      creator: {
        userId: creatorId,
        email: creatorEmail,
      },
      memberships,
      invites,
      contributions,
      recentActivity: activityRes.data || [],
      summary: {
        activeCount: memberships.filter((item) => item.status === 'active').length,
        pendingCount: invites.filter((item) => item.status === 'pending').length,
        contributionCount: contributions.length,
        pendingModerationCount: contributions.filter((c) => c.status === 'submitted').length,
      },
    });
  } catch (error) {
    console.error('USER DASH contributors GET error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user } = await getAuthenticatedUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const memoryId = String(id || '');
    const body = await request.json();
    const email = normalizeContributorEmail(body?.email);
    const role = normalizeCollaboratorRole(body?.role);

    if (!memoryId || !email) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const admin = getSupabaseAdmin();
    const accessGranted = await canAdministerMemory(admin, memoryId, user.id);
    if (!accessGranted) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { data: memory } = await admin
      .from('memories')
      .select('id, data, firstname, lastname')
      .eq('id', memoryId)
      .single();

    if (!memory) return NextResponse.json({ error: 'Memorial not found' }, { status: 404 });

    const now = new Date().toISOString();
    const existingMembership = await admin
      .from('memory_memberships')
      .select('id, status, user_id')
      .eq('memory_id', memoryId)
      .eq('email', email)
      .maybeSingle();

    if (existingMembership.data?.status === 'active' && existingMembership.data?.user_id) {
      return NextResponse.json(
        { error: 'Cette personne a deja acces a cet espace.' },
        { status: 409 }
      );
    }

    await admin
      .from('memory_invites')
      .update({ status: 'revoked', updated_at: now })
      .eq('memory_id', memoryId)
      .eq('email', email)
      .eq('status', 'pending');

    const membershipPayload = {
      memory_id: memoryId,
      email,
      role,
      status: 'invited',
      invited_by_user_id: user.id,
      invited_at: now,
      updated_at: now,
      user_id: existingMembership.data?.user_id || null,
      joined_at: existingMembership.data?.status === 'active' ? now : null,
    };

    const { error: membershipError } = await admin
      .from('memory_memberships')
      .upsert(membershipPayload, { onConflict: 'memory_id,email' });

    if (membershipError) {
      console.error('memory membership upsert error:', membershipError);
      return NextResponse.json({ error: 'Unable to save collaborator access' }, { status: 500 });
    }

    let accessCode = '';
    for (let attempt = 0; attempt < 4; attempt += 1) {
      accessCode = generateInviteAccessCode();
      const { data: codeConflict } = await admin
        .from('memory_invites')
        .select('id')
        .eq('access_code', accessCode)
        .maybeSingle();
      if (!codeConflict) break;
      accessCode = '';
    }
    if (!accessCode) accessCode = generateInviteAccessCode();

    const token = generateInviteToken();
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString();

    const { data: invite, error: inviteError } = await admin
      .from('memory_invites')
      .insert({
        memory_id: memoryId,
        email,
        role,
        token,
        access_code: accessCode,
        invited_by_user_id: user.id,
        status: 'pending',
        expires_at: expiresAt,
        created_at: now,
        updated_at: now,
      })
      .select('id, email, role, token, access_code, expires_at, created_at')
      .single();

    if (inviteError || !invite) {
      console.error('memory invite create error:', inviteError);
      return NextResponse.json({ error: 'Unable to create invite' }, { status: 500 });
    }

    const inviteUrl = `${request.nextUrl.origin}/invite/${invite.token}`;
    const emailDelivery = await sendMemoryInviteEmail({
      toEmail: invite.email,
      memoryTitle: resolveMemoryDisplayName(memory),
      inviteUrl,
      accessCode: invite.access_code,
      role: invite.role,
      inviterName: user.user_metadata?.name || user.email || 'Un proche',
      expiresAt: invite.expires_at,
    });

    await appendMemoryActivityLog(admin, {
      memoryId,
      actorUserId: user.id,
      actorEmail: user.email || null,
      actorRole: 'owner',
      action: 'invite_created',
      targetType: 'memory_invite',
      targetId: invite.id,
      metadata: {
        email,
        role,
        accessCode,
      },
    });

    await appendMemoryActivityLog(admin, {
      memoryId,
      actorUserId: user.id,
      actorEmail: user.email || null,
      actorRole: 'owner',
      action: emailDelivery.sent ? 'invite_email_sent' : 'invite_email_not_sent',
      targetType: 'memory_invite',
      targetId: invite.id,
      metadata: {
        email,
        mode: emailDelivery.mode,
        reason: 'reason' in emailDelivery ? emailDelivery.reason || null : null,
      },
    });

    return NextResponse.json({
      success: true,
      invite: {
        id: invite.id,
        email: invite.email,
        role: invite.role,
        accessCode: invite.access_code,
        expiresAt: invite.expires_at,
        createdAt: invite.created_at,
        inviteUrl,
        qrDownloadUrl: `${request.nextUrl.origin}/api/memory-invites/${invite.token}/qr`,
      },
      emailDelivery,
    });
  } catch (error) {
    console.error('USER DASH contributors POST error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
