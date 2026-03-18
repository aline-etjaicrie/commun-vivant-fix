import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/app/api/user-dashboard/_shared';
import { getSupabaseAdmin } from '@/lib/server/supabaseAdmin';
import { appendMemoryActivityLog } from '@/lib/server/memoryCollaboration';

export const runtime = 'nodejs';


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

    const body = await request.json();
    const authorName = String(body?.authorName || '').trim();
    const relationship = String(body?.relationship || '').trim();
    const content = String(body?.content || '').trim();

    if (!content) {
      return NextResponse.json({ error: 'Contribution vide' }, { status: 400 });
    }

    const admin = getSupabaseAdmin();
    const { data: invite } = await admin
      .from('memory_invites')
      .select('id, memory_id, email, role, status')
      .eq('token', inviteToken)
      .maybeSingle();

    if (!invite) return NextResponse.json({ error: 'Invite not found' }, { status: 404 });
    if (invite.status !== 'claimed') {
      return NextResponse.json({ error: 'Invite not claimed yet' }, { status: 409 });
    }

    const userEmail = String(user.email || '').trim().toLowerCase();
    if (!userEmail || userEmail !== invite.email) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { data: membership } = await admin
      .from('memory_memberships')
      .select('id')
      .eq('memory_id', invite.memory_id)
      .eq('email', invite.email)
      .maybeSingle();

    const now = new Date().toISOString();
    const { data: contribution, error: contributionError } = await admin
      .from('memory_contributions')
      .insert({
        memory_id: invite.memory_id,
        membership_id: membership?.id || null,
        invite_id: invite.id,
        author_user_id: user.id,
        author_email: userEmail,
        author_name: authorName || user.user_metadata?.name || userEmail,
        relationship_label: relationship || null,
        content,
        status: 'submitted',
        source: 'invite',
        created_at: now,
        updated_at: now,
      })
      .select('id, created_at')
      .single();

    if (contributionError || !contribution) {
      console.error('MEMORY CONTRIBUTION create error:', contributionError);
      return NextResponse.json({ error: 'Unable to save contribution' }, { status: 500 });
    }

    if (membership?.id) {
      await admin
        .from('memory_memberships')
        .update({ last_seen_at: now, updated_at: now })
        .eq('id', membership.id);
    }

    await appendMemoryActivityLog(admin, {
      memoryId: invite.memory_id,
      actorUserId: user.id,
      actorEmail: user.email || null,
      actorRole: invite.role,
      source: 'invite_link',
      action: 'contribution_submitted',
      targetType: 'memory_contribution',
      targetId: contribution.id,
      metadata: {
        relationship,
      },
    });

    return NextResponse.json({
      success: true,
      contribution: {
        id: contribution.id,
        createdAt: contribution.created_at,
      },
    });
  } catch (error) {
    console.error('MEMORY CONTRIBUTION POST error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
