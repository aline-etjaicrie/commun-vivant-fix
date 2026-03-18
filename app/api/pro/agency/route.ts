import { NextRequest, NextResponse } from 'next/server';
import { getProContext, isAdminRole } from '@/app/api/pro/_shared';

export const runtime = 'nodejs';


export async function PATCH(request: NextRequest) {
  try {
    const ctx = await getProContext(request);
    if (!ctx) {
      return NextResponse.json({ error: 'Unauthorized pro access' }, { status: 401 });
    }
    if (!isAdminRole(ctx.membership.role)) {
      return NextResponse.json({ error: 'Admin role required' }, { status: 403 });
    }

    const body = await request.json();
    const allowed: Record<string, any> = {};

    if (typeof body.name === 'string') allowed.name = body.name;
    if (typeof body.subscriptionType === 'string') allowed.subscription_type = body.subscriptionType;
    if (typeof body.subscriptionPrice === 'number') allowed.subscription_price = body.subscriptionPrice;
    if (typeof body.subscriptionRenewalDate === 'string') allowed.subscription_renewal_date = body.subscriptionRenewalDate;
    if (typeof body.displayName === 'string') allowed.display_name = body.displayName;
    if (typeof body.partnerMention === 'string') allowed.partner_mention = body.partnerMention;
    if (typeof body.logoUrl === 'string') allowed.logo_url = body.logoUrl;
    if (typeof body.signature === 'string') allowed.signature = body.signature;
    if (typeof body.primaryColor === 'string') allowed.primary_color = body.primaryColor;
    if (typeof body.introPageText === 'string') allowed.intro_page_text = body.introPageText;
    if (typeof body.customMessage === 'string') allowed.custom_message = body.customMessage;

    if (Object.keys(allowed).length === 0) {
      return NextResponse.json({ error: 'No valid field provided' }, { status: 400 });
    }

    const { data, error } = await (ctx.supabase as any)
      .from('agencies')
      .update(allowed)
      .eq('id', ctx.membership.agency_id)
      .select('*')
      .single();

    if (error) {
      console.error('PRO agency update error:', error);
      return NextResponse.json({ error: 'Unable to update agency' }, { status: 500 });
    }

    return NextResponse.json({ agency: data });
  } catch (error) {
    console.error('PRO agency patch error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
