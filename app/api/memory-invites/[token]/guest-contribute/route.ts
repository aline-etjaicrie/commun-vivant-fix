import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/server/supabaseAdmin';
import { appendMemoryActivityLog } from '@/lib/server/memoryCollaboration';

export const runtime = 'nodejs';

/**
 * POST /api/memory-invites/[token]/guest-contribute
 *
 * Permet à un contributeur d'envoyer un souvenir sans compte ni authentification.
 * Le token d'invitation est la seule autorisation requise.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const inviteToken = String(token || '').trim();
    if (!inviteToken) return NextResponse.json({ error: 'Missing token' }, { status: 400 });

    const body = await request.json();
    const authorName = String(body?.authorName || '').trim();
    const relationship = String(body?.relationship || '').trim();
    const content = String(body?.content || '').trim();

    if (content.length < 10) {
      return NextResponse.json({ error: 'Contribution trop courte' }, { status: 400 });
    }

    const admin = getSupabaseAdmin();
    const { data: invite } = await admin
      .from('memory_invites')
      .select('id, memory_id, status, expires_at')
      .eq('token', inviteToken)
      .maybeSingle();

    if (!invite) return NextResponse.json({ error: 'Invite not found' }, { status: 404 });

    const expired = new Date(invite.expires_at) < new Date();
    if (expired || invite.status === 'expired' || invite.status === 'revoked') {
      return NextResponse.json({ error: 'Invite expired or revoked' }, { status: 410 });
    }

    const now = new Date().toISOString();
    const { data: contribution, error: contributionError } = await admin
      .from('memory_contributions')
      .insert({
        memory_id: invite.memory_id,
        invite_id: invite.id,
        membership_id: null,
        author_user_id: null,
        author_email: null,
        author_name: authorName || 'Anonyme',
        relationship_label: relationship || null,
        content,
        status: 'submitted',
        source: 'invite_guest',
        created_at: now,
        updated_at: now,
      })
      .select('id, created_at')
      .single();

    if (contributionError || !contribution) {
      console.error('GUEST CONTRIBUTION create error:', contributionError);
      return NextResponse.json({ error: 'Unable to save contribution' }, { status: 500 });
    }

    await appendMemoryActivityLog(admin, {
      memoryId: invite.memory_id,
      actorUserId: null,
      actorEmail: null,
      actorRole: 'contributor',
      source: 'invite_guest',
      action: 'contribution_submitted',
      targetType: 'memory_contribution',
      targetId: contribution.id,
      metadata: { relationship, authorName, guestMode: true },
    });

    return NextResponse.json({
      success: true,
      contribution: {
        id: contribution.id,
        createdAt: contribution.created_at,
      },
    });
  } catch (error) {
    console.error('GUEST CONTRIBUTION POST error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
