import { TemplateConfig } from '@/lib/templates';

export type TextTypography = 'serif' | 'sans' | 'calligraphy';
export type ProfilePhotoShape = 'round' | 'square';
export type TributeDisplayMode = 'both' | 'candle' | 'flower';
export type ThematicSection = { title: string; content: string };

export function safeParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function sanitizeGeneratedText(value: string | null | undefined): string {
  if (!value) return '';
  return value
    .replace(/\*\[.*?\]\*/g, '')
    .replace(/\*\*/g, '')
    .replace(/(^|\s)\*(?=\S)/g, '$1')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

export function ensureAbsoluteUrl(url: string): string {
  const trimmed = String(url || '').trim();
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed) || /^mailto:/i.test(trimmed) || /^tel:/i.test(trimmed)) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

export function resolveIdentity(payload: any) {
  const identite = payload?.identite || {};
  const defunt = payload?.defunt || {};
  const prenom = identite?.prenom || defunt?.prenom || payload?.prenom || '';
  const nom = identite?.nom || defunt?.nom || payload?.nom || '';
  return {
    ...identite,
    prenom,
    nom,
    dateNaissance: identite?.dateNaissance || payload?.dateNaissance || null,
    dateDeces: identite?.dateDeces || payload?.dateDeces || null,
  };
}

export function resolveTypographyPreference(value: any): TextTypography {
  if (value === 'sans' || value === 'serif' || value === 'calligraphy') return value;
  return 'serif';
}

export function applyTypographyPreference(template: TemplateConfig, pref: TextTypography): TemplateConfig {
  const next = { ...template };
  if (pref === 'sans') {
    next.typography = 'sans-serif';
    next.fonts = { ...template.fonts, heading: 'font-semibold tracking-normal', body: 'font-normal leading-relaxed' };
    return next;
  }
  if (pref === 'calligraphy') {
    next.typography = 'calligraphy';
    next.fonts = { ...template.fonts, heading: 'font-calli italic tracking-wide', body: 'font-calli italic leading-loose' };
    return next;
  }
  next.typography = 'serif';
  next.fonts = { ...template.fonts, heading: 'font-serif tracking-normal', body: 'font-serif leading-loose' };
  return next;
}

const normalize = (value: unknown): string => String(value || '').trim();

const asList = (value: unknown): string => {
  if (!value) return '';
  if (Array.isArray(value)) {
    return value.map((item) => normalize(item)).filter(Boolean).join(', ');
  }
  return normalize(value);
};

export function buildThematicSections(payload: any): ThematicSection[] {
  const source = payload?.identite || payload || {};
  const talents = source?.talents || payload?.talents || {};
  const liens = source?.liens || payload?.liens || source?.liensVie || payload?.liensVie || {};
  const gouts = source?.gouts || payload?.gouts || {};

  const sections: ThematicSection[] = [
    { title: 'Sa carriere', content: asList(talents?.carriere) },
    { title: 'Ses sports', content: asList(talents?.sport) },
    { title: 'Sa blague preferee', content: asList(talents?.blagues) },
    { title: 'Ses voyages', content: asList(liens?.voyages) },
    { title: 'Ses lieux de vie', content: asList(liens?.lieuxDeVie) },
    { title: 'Les personnes qui comptent', content: asList(liens?.personnesQuiComptent || liens?.amis) },
    { title: 'Anecdotes marquantes', content: asList(liens?.anecdotes) },
    { title: 'Ses gouts', content: asList(gouts?.plat || gouts?.phrase) },
  ];

  return sections.filter((section) => section.content);
}
