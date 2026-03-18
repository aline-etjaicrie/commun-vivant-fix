import { NextRequest, NextResponse } from 'next/server';
import { getProContext, isAdminRole } from '@/app/api/pro/_shared';

export const runtime = 'nodejs';


export async function GET(request: NextRequest) {
  try {
    const ctx = await getProContext(request);
    if (!ctx) return NextResponse.json({ error: 'Unauthorized pro access' }, { status: 401 });

    const { data: rows, error } = await (ctx.supabase as any)
      .from('agency_users')
      .select('id, user_id, role, created_at')
      .eq('agency_id', ctx.membership.agency_id)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: 'Unable to fetch team' }, { status: 500 });
    }

    const userIds = (rows || []).map((row: any) => row.user_id).filter(Boolean);
    const { data: usersRows } = userIds.length
      ? await (ctx.supabase as any).from('users').select('id, email, full_name, name').in('id', userIds)
      : { data: [] as any[] };

    const usersMap = (usersRows || []).reduce((acc: Record<string, any>, row: any) => {
      acc[row.id] = row;
      return acc;
    }, {});

    const team = (rows || []).map((member: any) => ({
      id: member.id,
      userId: member.user_id,
      role: member.role,
      createdAt: member.created_at,
      fullName: usersMap[member.user_id]?.full_name || usersMap[member.user_id]?.name || usersMap[member.user_id]?.email || 'Collaborateur',
      email: usersMap[member.user_id]?.email || '',
    }));

    return NextResponse.json({ team });
  } catch (error) {
    console.error('PRO team get error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const ctx = await getProContext(request);
    if (!ctx) return NextResponse.json({ error: 'Unauthorized pro access' }, { status: 401 });
    if (!isAdminRole(ctx.membership.role)) {
      return NextResponse.json({ error: 'Admin role required' }, { status: 403 });
    }

    const body = await request.json();
    const email = String(body?.email || '').trim().toLowerCase();
    const role = String(body?.role || '').trim();

    if (!email || !['admin', 'editor', 'viewer', 'accountant'].includes(role)) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const { data: userRow, error: userError } = await (ctx.supabase as any)
      .from('users')
      .select('id, email, full_name, name')
      .eq('email', email)
      .single();

    if (userError || !userRow) {
      return NextResponse.json({ error: 'User not found. The collaborator must already have an account.' }, { status: 404 });
    }

    const { data, error } = await (ctx.supabase as any)
      .from('agency_users')
      .upsert({
        agency_id: ctx.membership.agency_id,
        user_id: userRow.id,
        role,
      })
      .select('id, user_id, role, created_at')
      .single();

    if (error) {
      console.error('PRO team add error:', error);
      return NextResponse.json({ error: 'Unable to add collaborator' }, { status: 500 });
    }

    return NextResponse.json({
      member: {
        id: data.id,
        userId: data.user_id,
        role: data.role,
        createdAt: data.created_at,
        fullName: userRow.full_name || userRow.name || userRow.email,
        email: userRow.email,
      },
    });
  } catch (error) {
    console.error('PRO team post error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const ctx = await getProContext(request);
    if (!ctx) return NextResponse.json({ error: 'Unauthorized pro access' }, { status: 401 });
    if (!isAdminRole(ctx.membership.role)) {
      return NextResponse.json({ error: 'Admin role required' }, { status: 403 });
    }

    const body = await request.json();
    const memberId = String(body?.memberId || '');
    const role = String(body?.role || '').trim();

    if (!memberId || !['admin', 'editor', 'viewer', 'accountant'].includes(role)) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const { data, error } = await (ctx.supabase as any)
      .from('agency_users')
      .update({ role })
      .eq('id', memberId)
      .eq('agency_id', ctx.membership.agency_id)
      .select('id, user_id, role, created_at')
      .single();

    if (error || !data) {
      return NextResponse.json({ error: 'Unable to update role' }, { status: 500 });
    }

    return NextResponse.json({ member: data });
  } catch (error) {
    console.error('PRO team patch error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const ctx = await getProContext(request);
    if (!ctx) return NextResponse.json({ error: 'Unauthorized pro access' }, { status: 401 });
    if (!isAdminRole(ctx.membership.role)) {
      return NextResponse.json({ error: 'Admin role required' }, { status: 403 });
    }

    const body = await request.json();
    const memberId = String(body?.memberId || '');

    if (!memberId) {
      return NextResponse.json({ error: 'Missing memberId' }, { status: 400 });
    }

    const { error } = await (ctx.supabase as any)
      .from('agency_users')
      .delete()
      .eq('id', memberId)
      .eq('agency_id', ctx.membership.agency_id);

    if (error) {
      return NextResponse.json({ error: 'Unable to remove collaborator' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('PRO team delete error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
