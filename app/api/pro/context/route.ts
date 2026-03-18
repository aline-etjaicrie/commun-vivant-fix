import { NextRequest, NextResponse } from 'next/server';
import { getProContext } from '@/app/api/pro/_shared';

export const runtime = 'nodejs';


export async function GET(request: NextRequest) {
  try {
    const ctx = await getProContext(request);
    if (!ctx) {
      return NextResponse.json({ error: 'Unauthorized pro access' }, { status: 401 });
    }

    return NextResponse.json({
      user: ctx.user,
      agencyId: ctx.membership.agency_id,
      role: ctx.membership.role,
      agencyName: ctx.agency.name,
    });
  } catch (error) {
    console.error('PRO context error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
