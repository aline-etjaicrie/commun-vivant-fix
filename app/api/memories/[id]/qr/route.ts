import { NextRequest, NextResponse } from 'next/server';
// @ts-ignore
import QRCode from 'qrcode';
import { getSupabaseClient } from '@/app/api/user-dashboard/_shared';
import { resolveMemoryPublicUrl, type PublicationUrlMode } from '@/lib/memoryPublication';
import { canAdministerMemory } from '@/lib/server/memoryCollaboration';
import { getSupabaseAdmin } from '@/lib/server/supabaseAdmin';

export const runtime = 'nodejs';


type QrMode = PublicationUrlMode;

async function getAuthenticatedUserId(request: NextRequest): Promise<string | null> {
  const userClient = getSupabaseClient(request.headers.get('authorization'));
  const {
    data: { user },
  } = await userClient.auth.getUser();
  return user?.id || null;
}

async function fetchMemoryForQr(admin: any, id: string): Promise<any | null> {
  const primary = await admin
    .from('memories')
    .select('id, slug, qr_path, public_url, data, firstname, lastname, agency_id, user_id, owner_user_id, publication_status')
    .eq('id', id)
    .maybeSingle();

  if (!primary.error && primary.data) return primary.data;

  const fallback = await admin
    .from('memories')
    .select('id, data, firstname, lastname, agency_id, user_id, owner_user_id, publication_status')
    .eq('id', id)
    .maybeSingle();

  if (!fallback.error && fallback.data) {
    return {
      ...fallback.data,
      slug: null,
      qr_path: null,
      public_url: null,
    };
  }
  return null;
}

async function resolvePublicUrl(admin: any, memory: any, mode: QrMode): Promise<{ publicUrl: string; agencySlug?: string | null }> {
  const resolved = await resolveMemoryPublicUrl(admin, memory, mode);
  memory.slug = resolved.slug;
  memory.public_url = resolved.publicUrl;
  return {
    publicUrl: resolved.publicUrl,
    agencySlug: resolved.agency?.slug || null,
  };
}

async function generateAndStoreQr(params: { admin: any; memory: any; mode: QrMode }) {
  const { admin, memory, mode } = params;
  const { publicUrl } = await resolvePublicUrl(admin, memory, mode);

  const png = await QRCode.toBuffer(publicUrl, {
    type: 'png',
    width: 1024,
    margin: 1,
    errorCorrectionLevel: 'M',
  });

  const qrPath = `qr/${memory.id}.png`;
  const upload = await admin.storage.from('qr-codes').upload(qrPath, png, {
    upsert: true,
    contentType: 'image/png',
  });

  if (upload.error) {
    throw new Error(`QR upload failed: ${upload.error.message}`);
  }

  const update = await admin
    .from('memories')
    .update({
      qr_path: qrPath,
      qr_status: 'generated',
      public_url: publicUrl,
    })
    .eq('id', memory.id);

  if (update.error) {
    throw new Error(`QR metadata update failed: ${update.error.message}`);
  }

  return { publicUrl, qrPath };
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getAuthenticatedUserId(request);
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await context.params;
    if (!id) return NextResponse.json({ error: 'Missing memory id' }, { status: 400 });

    const body = await request.json().catch(() => ({}));
    const mode: QrMode = ['b2c', 'b2b', 'auto'].includes(body?.mode) ? body.mode : 'auto';

    const admin = getSupabaseAdmin();
    const memory = await fetchMemoryForQr(admin, id);
    if (!memory) {
      return NextResponse.json({ error: 'Memory not found' }, { status: 404 });
    }

    const allowed = await canAdministerMemory(admin, id, userId);
    if (!allowed) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const generated = await generateAndStoreQr({ admin, memory, mode });
    return NextResponse.json({ ok: true, ...generated });
  } catch (error: any) {
    console.error('QR generation error:', error);
    return NextResponse.json({ error: error?.message || 'Unable to generate QR' }, { status: 500 });
  }
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getAuthenticatedUserId(request);
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await context.params;
    if (!id) return NextResponse.json({ error: 'Missing memory id' }, { status: 400 });

    const mode = (request.nextUrl.searchParams.get('mode') || 'auto') as QrMode;
    const admin = getSupabaseAdmin();
    const memory = await fetchMemoryForQr(admin, id);
    if (!memory) {
      return NextResponse.json({ error: 'Memory not found' }, { status: 404 });
    }

    const allowed = await canAdministerMemory(admin, id, userId);
    if (!allowed) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    let qrPath = memory.qr_path as string | null;
    if (!qrPath) {
      const generated = await generateAndStoreQr({ admin, memory, mode });
      qrPath = generated.qrPath;
    }

    const signed = await admin.storage.from('qr-codes').createSignedUrl(qrPath, 600);
    if (signed.error || !signed.data?.signedUrl) {
      return NextResponse.json({ error: 'Unable to sign QR URL' }, { status: 500 });
    }

    const { publicUrl } = await resolvePublicUrl(admin, memory, mode);
    return NextResponse.json({ ok: true, downloadUrl: signed.data.signedUrl, publicUrl, qrPath });
  } catch (error: any) {
    console.error('QR signed URL error:', error);
    return NextResponse.json({ error: error?.message || 'Unable to fetch QR URL' }, { status: 500 });
  }
}
