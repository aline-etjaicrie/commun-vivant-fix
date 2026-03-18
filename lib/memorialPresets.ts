import { CommunType } from '@/lib/communTypes';
import { AVAILABLE_BLOCKS, BlockType } from '@/lib/layouts';
import { getTemplatesForCommunType } from '@/lib/templates';

const FALLBACK_BLOCK_ORDER: BlockType[] = [
  'profile',
  'quote',
  'text',
  'family',
  'location',
  'gallery',
  'gouts',
  'messages',
  'candle',
  'contribute',
  'links',
];

export interface MemorialPreset {
  layout: 'classic' | 'editorial' | 'magazine';
  blockOrder: BlockType[];
}

const PRESETS: Record<CommunType, MemorialPreset> = {
  deces: {
    layout: 'classic',
    blockOrder: ['profile', 'quote', 'text', 'family', 'location', 'gallery', 'gouts', 'messages', 'candle', 'contribute', 'links'],
  },
  'hommage-vivant': {
    layout: 'magazine',
    blockOrder: ['profile', 'quote', 'text', 'gallery', 'gouts', 'messages', 'family', 'location', 'contribute', 'links', 'candle'],
  },
  'transmission-familiale': {
    layout: 'editorial',
    blockOrder: ['profile', 'family', 'text', 'location', 'gallery', 'gouts', 'messages', 'contribute', 'links', 'quote', 'candle'],
  },
  'memoire-objet': {
    layout: 'editorial',
    blockOrder: ['profile', 'quote', 'text', 'gallery', 'location', 'gouts', 'messages', 'links', 'family', 'contribute', 'candle'],
  },
  'pro-ceremonie': {
    layout: 'classic',
    blockOrder: ['profile', 'text', 'location', 'messages', 'links', 'quote', 'gallery', 'gouts', 'family', 'contribute', 'candle'],
  },
};

export function sanitizeBlockOrder(input?: unknown): BlockType[] {
  if (!Array.isArray(input)) return [...FALLBACK_BLOCK_ORDER];
  const allowed = new Set(AVAILABLE_BLOCKS.map((b) => b.id));
  const unique = new Set<BlockType>();

  for (const item of input) {
    if (typeof item !== 'string') continue;
    if (!allowed.has(item as BlockType)) continue;
    unique.add(item as BlockType);
  }

  for (const block of FALLBACK_BLOCK_ORDER) {
    if (!unique.has(block)) unique.add(block);
  }

  const sanitized = Array.from(unique);
  if (!sanitized.includes('profile')) sanitized.unshift('profile');
  if (!sanitized.includes('text')) sanitized.splice(1, 0, 'text');
  return sanitized;
}

export function getMemorialPreset(communType: CommunType): MemorialPreset {
  const preset = PRESETS[communType] || PRESETS.deces;
  return {
    layout: preset.layout,
    blockOrder: sanitizeBlockOrder(preset.blockOrder),
  };
}

export function getDefaultTemplateIdForCommunType(communType: CommunType): string {
  const templates = getTemplatesForCommunType(communType);
  return templates[0]?.id || 'deces-dignite';
}
