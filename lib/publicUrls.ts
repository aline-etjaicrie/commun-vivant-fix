const DEFAULT_PUBLIC_BASE = 'https://cv-memoire.fr';

function trimTrailingSlash(value: string): string {
  return value.endsWith('/') ? value.slice(0, -1) : value;
}

function safeSegment(value: string): string {
  return encodeURIComponent(value.trim());
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

  return trimTrailingSlash(raw);
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
