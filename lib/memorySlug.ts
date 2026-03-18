import { slugify } from '@/lib/slugify';

function shortId(input: string): string {
  return input.replace(/[^a-zA-Z0-9]/g, '').toLowerCase().slice(0, 8) || 'memoire';
}

export type MemorySlugInput = {
  id: string;
  data?: any;
  firstname?: string | null;
  lastname?: string | null;
  agency_id?: string | null;
};

export type MemorySlugAgencyInput = {
  slug?: string | null;
  name?: string | null;
  display_name?: string | null;
};

function compactSlugPart(value: string): string {
  return slugify(value).replace(/-/g, '');
}

function buildPersonSlugPart(memory: MemorySlugInput): string {
  const data = memory.data || {};
  const identite = data.identite || {};
  const firstName = String(identite.prenom || data.prenom || memory.firstname || '').trim();
  const lastName = String(identite.nom || data.nom || memory.lastname || '').trim();

  return compactSlugPart([firstName, lastName].filter(Boolean).join(' '));
}

function buildAgencySlugPart(agency?: MemorySlugAgencyInput | null): string {
  if (!agency) return '';
  const label = String(agency.display_name || agency.name || agency.slug || '').trim();
  return compactSlugPart(label);
}

export function buildMemorySlugFallback(
  memoryId: string,
  options: {
    isProManaged?: boolean;
    agency?: MemorySlugAgencyInput | null;
  } = {}
): string {
  const compactId = shortId(memoryId);

  if (options.isProManaged) {
    const agencyPart = buildAgencySlugPart(options.agency) || 'agence';
    return `memoire${compactId}-${agencyPart}`;
  }

  return `commun-vivant-${compactId}`;
}

export function buildMemorySlugCandidate(
  memory: MemorySlugInput,
  options: {
    isProManaged?: boolean;
    agency?: MemorySlugAgencyInput | null;
  } = {}
): string {
  const personPart = buildPersonSlugPart(memory);

  if (options.isProManaged) {
    const agencyPart = buildAgencySlugPart(options.agency) || 'agence';
    if (personPart) return `${personPart}-${agencyPart}`;
    return buildMemorySlugFallback(memory.id, options);
  }

  if (personPart) return `commun-vivant-${personPart}`;
  return buildMemorySlugFallback(memory.id, options);
}

export async function ensureUniqueMemorySlug(
  supabaseAdmin: any,
  baseSlug: string,
  excludeMemoryId?: string
): Promise<string> {
  let attempt = 0;
  let candidate = baseSlug;

  while (attempt < 50) {
    const { data, error } = await supabaseAdmin
      .from('memories')
      .select('id')
      .eq('slug', candidate)
      .maybeSingle();

    if (!error && (!data || data.id === excludeMemoryId)) {
      return candidate;
    }

    attempt += 1;
    candidate = `${baseSlug}-${attempt + 1}`;
  }

  return `${baseSlug}-${Date.now().toString().slice(-4)}`;
}
