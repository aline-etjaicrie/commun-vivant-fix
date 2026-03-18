import { buildB2BPath, buildB2CPath } from '@/lib/publicUrls';
import { getSupabaseAdmin } from '@/lib/server/supabaseAdmin';

export type PublicResolveResult =
  | { status: 'not_found' }
  | { status: 'unpublished'; reason: 'draft' | 'archived' }
  | { status: 'suspended' }
  | {
      status: 'ok';
      memory: any;
      agency: any | null;
      resolvedPath: string;
      routeMode: 'b2c' | 'b2b';
    };

async function getMemoryBySlugOrId(memorySlug: string): Promise<any | null> {
  const admin = getSupabaseAdmin();

  const bySlug = await admin
    .from('memories')
    .select('id, slug, data, template_choice, publication_status, access_status, agency_id, user_id, owner_user_id, created_at')
    .eq('slug', memorySlug)
    .maybeSingle();

  if (!bySlug.error && bySlug.data) {
    return bySlug.data;
  }

  // Backward compatibility if slug is not populated yet.
  const byId = await admin
    .from('memories')
    .select('id, data, template_choice, publication_status, access_status, agency_id, user_id, owner_user_id, created_at')
    .eq('id', memorySlug)
    .maybeSingle();

  if (!byId.error && byId.data) {
    return { ...byId.data, slug: memorySlug };
  }

  return null;
}

export async function resolvePublicMemorial(params: {
  memorySlug: string;
  agencySlug?: string | null;
}): Promise<PublicResolveResult> {
  const { memorySlug, agencySlug } = params;
  const memory = await getMemoryBySlugOrId(memorySlug);
  if (!memory) return { status: 'not_found' };

  if (memory.publication_status !== 'published') {
    return {
      status: 'unpublished',
      reason: memory.publication_status === 'archived' ? 'archived' : 'draft',
    };
  }

  if (memory.access_status === 'suspended') {
    return { status: 'suspended' };
  }

  const admin = getSupabaseAdmin();
  let agency: any | null = null;

  if (memory.agency_id) {
    const { data } = await admin
      .from('agencies')
      .select('id, name, slug, logo_url, partner_mention, display_name')
      .eq('id', memory.agency_id)
      .maybeSingle();
    agency = data || null;
  }

  if (agencySlug) {
    if (!agency || !agency.slug || agency.slug !== agencySlug) {
      return { status: 'not_found' };
    }
    return {
      status: 'ok',
      memory,
      agency,
      resolvedPath: buildB2BPath(agency.slug, memory.slug || memory.id),
      routeMode: 'b2b',
    };
  }

  const routeMode = agency ? 'b2b' : 'b2c';

  return {
    status: 'ok',
    memory,
    agency,
    resolvedPath:
      routeMode === 'b2b'
        ? buildB2BPath(agency?.slug || '', memory.slug || memory.id)
        : buildB2CPath(memory.slug || memory.id),
    routeMode,
  };
}

export async function trackMemoryVisit(params: {
  memoryId: string;
  agencyId?: string | null;
  ref?: string | null;
  userAgent?: string | null;
}): Promise<void> {
  const admin = getSupabaseAdmin();
  const ref = ['qr', 'nfc', 'direct', 'unknown'].includes(String(params.ref || ''))
    ? String(params.ref)
    : 'unknown';

  const payload = {
    memory_id: params.memoryId,
    agency_id: params.agencyId || null,
    ref,
    user_agent: params.userAgent || null,
    created_at: new Date().toISOString(),
  };

  const { error } = await admin.from('memory_visits').insert(payload);
  if (error) {
    // Non-blocking for public page rendering.
    console.warn('memory_visits insert skipped:', error.message);
  }
}
