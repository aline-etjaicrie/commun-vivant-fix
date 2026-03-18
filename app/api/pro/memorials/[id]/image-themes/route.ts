import { NextRequest, NextResponse } from 'next/server';
import { getProContext, isWriteRole } from '@/app/api/pro/_shared';

export const runtime = 'nodejs';


function sanitizeThemes(input: unknown): string[] {
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
    const ctx = await getProContext(request);
    if (!ctx) return NextResponse.json({ error: 'Unauthorized pro access' }, { status: 401 });
    if (!isWriteRole(ctx.membership.role)) {
      return NextResponse.json({ error: 'Write role required' }, { status: 403 });
    }

    const { id } = await context.params;
    if (!id) return NextResponse.json({ error: 'Missing memorial id' }, { status: 400 });

    const body = await request.json();
    const themes = sanitizeThemes(body?.themes);

    const { data, error } = await (ctx.supabase as any)
      .from('memories')
      .update({ image_themes: themes })
      .eq('id', id)
      .eq('agency_id', ctx.membership.agency_id)
      .select('id, image_themes')
      .single();

    if (error || !data) {
      return NextResponse.json({ error: 'Unable to save image themes' }, { status: 500 });
    }

    return NextResponse.json({ memorial: data });
  } catch (error) {
    console.error('PRO image themes error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

