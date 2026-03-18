import {
  buildMemorySlugCandidate,
  buildMemorySlugFallback,
  ensureUniqueMemorySlug,
  type MemorySlugAgencyInput,
  type MemorySlugInput,
} from '@/lib/memorySlug';
import { buildB2BUrl, buildB2CUrl } from '@/lib/publicUrls';

export type PublicationRouteMode = 'b2c' | 'b2b';
export type PublicationUrlMode = PublicationRouteMode | 'auto';

export type PublicationMemoryInput = MemorySlugInput & {
  slug?: string | null;
  agency_id?: string | null;
};

export async function fetchPublicationAgency(
  admin: any,
  agencyId?: string | null
): Promise<MemorySlugAgencyInput | null> {
  if (!agencyId) return null;

  const { data, error } = await admin
    .from('agencies')
    .select('slug, name, display_name')
    .eq('id', agencyId)
    .maybeSingle();

  if (error) {
    console.warn('Unable to fetch agency publication data:', error.message);
    return null;
  }

  return data || null;
}

function resolvePublicationRouteMode(
  memory: PublicationMemoryInput,
  mode: PublicationUrlMode
): PublicationRouteMode {
  if (mode === 'b2b') return 'b2b';
  if (mode === 'b2c') return 'b2c';
  return memory.agency_id ? 'b2b' : 'b2c';
}

export async function ensureMemoryPublicationSlug(
  admin: any,
  memory: PublicationMemoryInput,
  mode: PublicationUrlMode = 'auto'
): Promise<{ slug: string; routeMode: PublicationRouteMode; agency: MemorySlugAgencyInput | null }> {
  const routeMode = resolvePublicationRouteMode(memory, mode);
  const isProManaged = routeMode === 'b2b';
  const agency = isProManaged ? await fetchPublicationAgency(admin, memory.agency_id) : null;

  if (memory.slug) {
    return {
      slug: memory.slug,
      routeMode,
      agency,
    };
  }

  const base = buildMemorySlugCandidate(memory, {
    isProManaged,
    agency,
  });

  let slug = base;
  try {
    slug = await ensureUniqueMemorySlug(admin, base, memory.id);
  } catch {
    slug = buildMemorySlugFallback(memory.id, {
      isProManaged,
      agency,
    });
  }

  const { error } = await admin.from('memories').update({ slug }).eq('id', memory.id);
  if (error) {
    throw new Error(`Unable to save publication slug: ${error.message}`);
  }

  memory.slug = slug;

  return {
    slug,
    routeMode,
    agency,
  };
}

export async function resolveMemoryPublicUrl(
  admin: any,
  memory: PublicationMemoryInput,
  mode: PublicationUrlMode = 'auto'
): Promise<{
  slug: string;
  publicUrl: string;
  routeMode: PublicationRouteMode;
  agency: MemorySlugAgencyInput | null;
}> {
  const resolved = await ensureMemoryPublicationSlug(admin, memory, mode);
  const publicUrl =
    resolved.routeMode === 'b2b'
      ? buildB2BUrl(resolved.agency?.slug || resolved.agency?.name || '', resolved.slug)
      : buildB2CUrl(resolved.slug);

  return {
    ...resolved,
    publicUrl,
  };
}
