const DEFAULT_PUBLIC_BASE = 'https://cv-memoire.fr';

function trimTrailingSlash(value: string): string {
  return value.endsWith('/') ? value.slice(0, -1) : value;
}

function stripAccidentalLeadingSlashBeforeProtocol(value: string): string {
  return value.replace(/^\/+(?=https?:\/\/)/i, '');
}

function safeSegment(value: string): string {
  return encodeURIComponent(value.trim());
}

export function normalizeConfiguredBaseUrl(rawValue: string | null | undefined): string {
  const cleaned = stripAccidentalLeadingSlashBeforeProtocol(String(rawValue || '').trim());

  if (!cleaned) {
    return DEFAULT_PUBLIC_BASE;
  }

  try {
    return trimTrailingSlash(new URL(cleaned).toString());
  } catch {
    return trimTrailingSlash(cleaned);
  }
}

export function normalizePublicUrlOrPath(
  rawValue: string | null | undefined,
  fallbackPath: string
): string {
  const cleaned = stripAccidentalLeadingSlashBeforeProtocol(String(rawValue || '').trim());

  if (!cleaned) {
    return fallbackPath;
  }

  try {
    return new URL(cleaned).toString();
  } catch {
    return cleaned.startsWith('/') ? cleaned : `/${cleaned}`;
  }
}

export function buildPublicPath(memorySlug: string): string {
  return `/${safeSegment(memorySlug)}`;
}

export function buildLegacyB2CPath(memorySlug: string): string {
  return `/m/${safeSegment(memorySlug)}`;
}

export function buildLegacyB2BPath(agencySlug: string, memorySlug: string): string {
  return `/${safeSegment(agencySlug)}/${safeSegment(memorySlug)}`;
}

export function getPublicBaseUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_MEMORIAL_BASE_URL ||
    process.env.PUBLIC_MEMORIAL_BASE_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    DEFAULT_PUBLIC_BASE;

  return normalizeConfiguredBaseUrl(raw);
}

export function buildB2CPath(memorySlug: string): string {
  return buildPublicPath(memorySlug);
}

export function buildB2BPath(_agencySlug: string, memorySlug: string): string {
  return buildPublicPath(memorySlug);
}

export function buildB2CUrl(memorySlug: string): string {
  return `${getPublicBaseUrl()}${buildB2CPath(memorySlug)}`;
}

export function buildB2BUrl(agencySlug: string, memorySlug: string): string {
  return `${getPublicBaseUrl()}${buildB2BPath(agencySlug, memorySlug)}`;
}
