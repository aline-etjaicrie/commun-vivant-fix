import { NextRequest, NextResponse } from 'next/server';
// @ts-ignore
import QRCode from 'qrcode';
import { jsPDF } from 'jspdf';
import { getAuthenticatedUser } from '@/app/api/user-dashboard/_shared';
import { resolveMemoryPublicUrl } from '@/lib/memoryPublication';
import { canAdministerMemory, resolveMemoryDisplayName } from '@/lib/server/memoryCollaboration';
import { getSupabaseAdmin } from '@/lib/server/supabaseAdmin';

export const runtime = 'nodejs';


async function fetchMemory(admin: any, memoryId: string) {
  const primary = await admin
    .from('memories')
    .select('id, slug, public_url, agency_id, data, firstname, lastname')
    .eq('id', memoryId)
    .maybeSingle();

  if (!primary.error && primary.data) return primary.data;

  const fallback = await admin
    .from('memories')
    .select('id, agency_id, data, firstname, lastname')
    .eq('id', memoryId)
    .maybeSingle();

  if (!fallback.error && fallback.data) {
    return {
      ...fallback.data,
      slug: null,
      public_url: null,
    };
  }

  return null;
}

export async function GET(request: NextRequest) {
  try {
    const { user } = await getAuthenticatedUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const memoryId = String(request.nextUrl.searchParams.get('memoryId') || '').trim();
    if (!memoryId) {
      return NextResponse.json({ error: 'Missing memoryId' }, { status: 400 });
    }

    const admin = getSupabaseAdmin();
    const allowed = await canAdministerMemory(admin, memoryId, user.id);
    if (!allowed) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const memory = await fetchMemory(admin, memoryId);
    if (!memory) {
      return NextResponse.json({ error: 'Memory not found' }, { status: 404 });
    }

    const resolved = await resolveMemoryPublicUrl(admin, memory, memory.agency_id ? 'b2b' : 'b2c');
    const memorialUrl = resolved.publicUrl;
    const name = `Memoire de ${resolveMemoryDisplayName(memory)}`;

    const qrDataUrl = await QRCode.toDataURL(memorialUrl, { width: 400, margin: 1 });

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    doc.setFont('times', 'bold');
    doc.setFontSize(24);
    doc.setTextColor(26, 26, 46);
    doc.text(name, 105, 40, { align: 'center' });

    doc.setDrawColor(212, 175, 55);
    doc.setLineWidth(0.5);
    doc.line(70, 48, 140, 48);

    doc.addImage(qrDataUrl, 'PNG', 55, 60, 100, 100);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(14);
    doc.setTextColor(80, 80, 80);
    doc.text('Scannez pour acceder a la page publique', 105, 175, { align: 'center' });

    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text(memorialUrl, 105, 185, {
      align: 'center',
      maxWidth: 160,
    });

    doc.setFontSize(8);
    doc.setTextColor(200, 200, 200);
    doc.text('Commun Vivant - Raconter pour ne rien oublier', 105, 280, { align: 'center' });

    const pdfBuffer = doc.output('arraybuffer');

    return new Response(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="qr-code-${memoryId}.pdf"`,
      },
    });
  } catch (error: any) {
    console.error('QR PDF generation error:', error);
    return NextResponse.json({ error: error?.message || 'Unable to generate QR PDF' }, { status: 500 });
  }
}
