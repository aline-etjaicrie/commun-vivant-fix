import { NextRequest, NextResponse } from 'next/server';
import { jsPDF } from 'jspdf';

export const runtime = 'nodejs';


interface ExportPayload {
  title?: string;
  duration: '5' | '10' | '15';
  context: string;
  tone: string;
  text: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ExportPayload;
    const { title, duration, context, tone, text } = body || ({} as ExportPayload);

    if (!duration || !context || !tone || !text) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 56;
    const contentWidth = pageWidth - margin * 2;

    doc.setFont('times', 'bold');
    doc.setFontSize(18);
    doc.text('Texte de ceremonie civile - Solenn', margin, 64);

    doc.setFont('times', 'normal');
    doc.setFontSize(11);
    const metaLine = `Duree: ${duration} min   |   Contexte: ${context}   |   Tonalite: ${tone}`;
    doc.text(metaLine, margin, 88);
    if (title) {
      doc.text(`Sujet: ${title}`, margin, 106);
    }

    doc.setDrawColor(180);
    doc.line(margin, 118, pageWidth - margin, 118);

    doc.setFont('times', 'normal');
    doc.setFontSize(12);

    const lines = doc.splitTextToSize(text, contentWidth);
    let cursorY = 142;
    const lineHeight = 18;

    for (const line of lines) {
      if (cursorY > 790) {
        doc.addPage();
        cursorY = 64;
      }
      doc.text(line, margin, cursorY);
      cursorY += lineHeight;
    }

    const pdfArrayBuffer = doc.output('arraybuffer');
    const pdfBytes = new Uint8Array(pdfArrayBuffer);

    return new NextResponse(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="solenn-ceremonie.pdf"',
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('SOLENN export PDF error:', error);
    return NextResponse.json({ error: 'Unable to export PDF' }, { status: 500 });
  }
}
