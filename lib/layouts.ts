// Configuration des layouts de page

export type BlockType =
  | 'profile'
  | 'text'
  | 'messages'
  | 'gallery'
  | 'gouts'
  | 'candle'
  | 'links'
  | 'quote'
  | 'family'
  | 'location'
  | 'contribute';

export interface BlockConfig {
  id: BlockType;
  label: string;
  required?: boolean;
}

export interface LayoutConfig {
  id: string;
  name: string;
  description: string;
  columns: 1 | 2 | 3;
  blocks: BlockType[];
  columnBlocks?: {
    left?: BlockType[];
    center?: BlockType[];
    right?: BlockType[];
  };
}

export const AVAILABLE_BLOCKS: BlockConfig[] = [
  { id: 'profile', label: 'Photo & Nom', required: true },
  { id: 'text', label: 'Texte principal', required: true },
  { id: 'gallery', label: 'Galerie photos' },
  { id: 'family', label: 'Arbre Généalogique' },
  { id: 'location', label: 'Cérémonie & Lieu' },
  { id: 'gouts', label: 'Goûts & Musique' },
  { id: 'messages', label: 'Messages & Témoignages' },
  { id: 'candle', label: 'Espace Hommage' },
  { id: 'contribute', label: 'Contribution Visiteur' },
  { id: 'links', label: 'Liens & Cagnottes' },
  { id: 'quote', label: 'Citation' },
];

export const PRESET_LAYOUTS: LayoutConfig[] = [
  {
    id: 'classic',
    name: 'Classique',
    description: 'Une colonne, lecture linéaire',
    columns: 1,
    blocks: ['profile', 'quote', 'text', 'family', 'location', 'gallery', 'gouts', 'messages', 'candle', 'contribute', 'links'],
  },
  {
    id: 'editorial',
    name: 'Éditorial',
    description: 'Deux colonnes élégantes',
    columns: 2,
    blocks: ['profile', 'quote', 'text', 'family', 'location', 'gallery', 'gouts', 'messages', 'candle', 'contribute', 'links'],
    columnBlocks: {
      left: ['profile', 'family', 'location', 'candle', 'contribute'],
      right: ['quote', 'text', 'gallery', 'gouts', 'messages', 'links'],
    },
  },
  {
    id: 'magazine',
    name: 'Magazine',
    description: 'Asymétrique, moderne',
    columns: 2,
    blocks: ['profile', 'quote', 'text', 'family', 'location', 'gallery', 'gouts', 'messages', 'candle', 'contribute', 'links'],
    columnBlocks: {
      left: ['text', 'gallery', 'messages'],
      right: ['profile', 'quote', 'family', 'location', 'gouts', 'candle', 'contribute', 'links'],
    },
  },
];

export function getLayout(id: string): LayoutConfig {
  return PRESET_LAYOUTS.find(l => l.id === id) || PRESET_LAYOUTS[0];
}
