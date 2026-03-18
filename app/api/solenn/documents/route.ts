import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';


function getSupabaseClient(authHeader: string | null) {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: {
          Authorization: authHeader || '',
        },
      },
    }
  );
}

async function getAuthenticatedUser(request: NextRequest) {
  const supabase = getSupabaseClient(request.headers.get('authorization'));
  const { data: { user } } = await supabase.auth.getUser();
  return { supabase, user };
}

async function getAgencyMembership(supabase: any, userId: string): Promise<any | null> {
  const { data, error } = await supabase
    .from('agency_users')
    .select('agency_id, role')
    .eq('user_id', userId)
    .limit(1);
  if (error || !data || data.length === 0) return null;
  return data[0];
}

export async function GET(request: NextRequest) {
  try {
    const { supabase, user } = await getAuthenticatedUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const scope = request.nextUrl.searchParams.get('scope');
    const membership = await getAgencyMembership(supabase, user.id);
    const useAgencyScope = scope === 'agency' && membership?.agency_id;

    const query = supabase
      .from('solenn_documents')
      .select('id, title, duration_minutes, ceremony_context, tone, blocks, content, regeneration_count, created_at, updated_at, user_id, agency_id')
      .order('created_at', { ascending: false })
      .limit(200);

    const scopedQuery = useAgencyScope
      ? query.eq('agency_id', membership.agency_id)
      : query.eq('user_id', user.id);

    const { data, error } = await scopedQuery;

    if (error) {
      console.error('SOLENN GET documents error:', error);
      return NextResponse.json({ error: 'Unable to fetch documents' }, { status: 500 });
    }

    return NextResponse.json({ documents: data || [] });
  } catch (error) {
    console.error('SOLENN GET documents server error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { supabase, user } = await getAuthenticatedUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const membership = await getAgencyMembership(supabase, user.id);

    const body = await request.json();
    const {
      id,
      title,
      duration,
      context,
      tone,
      blocks,
      text,
      regenerationCount = 0,
    } = body || {};

    if (!duration || !context || !tone || !blocks || !text) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const payload = {
      user_id: user.id,
      agency_id: membership?.agency_id || null,
      title: title || null,
      duration_minutes: Number(duration),
      ceremony_context: context,
      tone,
      blocks,
      content: text,
      regeneration_count: Number(regenerationCount) || 0,
    };

    if (id) {
      const { data, error } = await supabase
        .from('solenn_documents')
        .update(payload)
        .eq('id', id)
        .eq('user_id', user.id)
        .select('*')
        .single();

      if (error) {
        console.error('SOLENN UPDATE document error:', error);
        return NextResponse.json({ error: 'Unable to update document' }, { status: 500 });
      }

      return NextResponse.json({ document: data });
    }

    const { data, error } = await supabase
      .from('solenn_documents')
      .insert(payload)
      .select('*')
      .single();

    if (error) {
      console.error('SOLENN INSERT document error:', error);
      return NextResponse.json({ error: 'Unable to create document' }, { status: 500 });
    }

    return NextResponse.json({ document: data });
  } catch (error) {
    console.error('SOLENN POST documents server error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
