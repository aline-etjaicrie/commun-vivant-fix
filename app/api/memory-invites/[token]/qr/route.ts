import { NextRequest, NextResponse } from 'next/server';
// @ts-ignore
import QRCode from 'qrcode';
import { getAuthenticatedUser } from '@/app/api/user-dashboard/_shared';
import {
  appendMemoryActivityLog,
  getMemoryAccessProfile,
  hasAdministrativeMemoryRole,
} from '@/lib/server/memoryCollaboration';
import { getSupabaseAdmin } from '@/lib/server/supabaseAdmin';

export const runtime = 'nodejs';


export async function GET(
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
      .select('id, memory_id, email, access_code, status')
      .eq('token', inviteToken)
      .maybeSingle();

    if (!invite) return NextResponse.json({ error: 'Invite not found' }, { status: 404 });

    const accessProfile = await getMemoryAccessProfile(admin, invite.memory_id, user.id);
    if (!hasAdministrativeMemoryRole(accessProfile.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const inviteUrl = `${request.nextUrl.origin}/invite/${inviteToken}`;
    const png = await QRCode.toBuffer(inviteUrl, {
      type: 'png',
      width: 960,
      margin: 1,
      errorCorrectionLevel: 'M',
    });

    await appendMemoryActivityLog(admin, {
      memoryId: invite.memory_id,
      actorUserId: user.id,
      actorEmail: user.email || null,
      actorRole: accessProfile.role,
      source: 'dashboard',
      action: 'invite_qr_downloaded',
      targetType: 'memory_invite',
      targetId: invite.id,
      metadata: {
        email: invite.email,
        status: invite.status,
      },
    });

    return new NextResponse(png, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Content-Disposition': `attachment; filename="invite-${invite.id}.png"`,
        'Cache-Control': 'no-store',
        'X-Invite-Access-Code': String(invite.access_code || ''),
      },
    });
  } catch (error: any) {
    console.error('MEMORY INVITE QR error:', error);
    return NextResponse.json({ error: error?.message || 'Unable to generate invite QR' }, { status: 500 });
  }
}
