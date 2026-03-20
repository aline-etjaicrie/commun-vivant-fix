/**
 * Templates finaux éditoriaux de Commun Vivant.
 *
 * Ces 3 templates correspondent directement aux pages d'exemples publiées :
 *   - portrait-sensitive  → /exemple/honorer-mina
 *   - memory-album        → /exemple/feter-marie
 *   - heritage-transmission → /exemple/transmettre-jean-jacques
 *
 * Chaque template définit la structure éditoriale et les blocs verrouillés /
 * réordonnables, ainsi que les valeurs par défaut de thème et de style.
 */

import type { BlockType } from '@/lib/layouts';
import type {
  CompositionModelId,
  VisualThemeId,
  WritingStyleId,
} from '@/lib/compositionStudio';
import type { TextTypography, TributeDisplayMode } from '@/lib/memorialRuntime';
import type { CommunType } from '@/lib/communTypes';

export interface FinalTemplate {
  /** Corresponds to CompositionModelId — single source of truth */
  id: CompositionModelId;
  label: string;
  tagline: string;
  communTypes: CommunType[];

  /** Slug de la page exemple qui sert de référence visuelle */
  exampleSlug: string;
  exampleTitle: string;

  /** Valeurs par défaut appliquées quand on sélectionne ce template */
  defaultVisualTheme: VisualThemeId;
  defaultWritingStyle: WritingStyleId;
  defaultTextTypography: TextTypography;
  defaultTributeMode: TributeDisplayMode;

  /**
   * Blocs dans leur ordre éditorial de référence (complet).
   * L'utilisateur peut réordonner les blocs NON verrouillés.
   */
  defaultBlockOrder: BlockType[];

  /**
   * Blocs structurellement fixes dans ce template.
   * Ils sont toujours affichés mais ne peuvent pas être déplacés.
   * Ex : 'profile' (hero) est toujours premier.
   */
  lockedBlocks: BlockType[];
}

export const FINAL_TEMPLATES: FinalTemplate[] = [
  {
    id: 'portrait-sensitive',
    label: 'Portrait sensible',
    tagline: 'Hommage centré sur la personne, la lecture et la respiration du récit.',
    communTypes: ['deces', 'hommage-vivant'],
    exampleSlug: 'honorer-mina',
    exampleTitle: 'Mina Azoulay — Honorer',
    defaultVisualTheme: 'memorial-soft',
    defaultWritingStyle: 'sensible-poetique',
    defaultTextTypography: 'serif',
    defaultTributeMode: 'both',
    defaultBlockOrder: [
      'profile',   // verrouillé — hero portrait
      'text',      // verrouillé — récit principal
      'gallery',
      'gouts',
      'family',
      'quote',
      'messages',
      'candle',
      'links',
      'contribute',
      'location',
    ],
    lockedBlocks: ['profile', 'text'],
  },
  {
    id: 'memory-album',
    label: 'Album de souvenirs',
    tagline: 'Hero immersif, images et récit en équilibre, galerie vivante.',
    communTypes: ['hommage-vivant', 'deces'],
    exampleSlug: 'feter-marie',
    exampleTitle: 'Marie Lacan — Fêter',
    defaultVisualTheme: 'celebration-vivid',
    defaultWritingStyle: 'lumineux-celebrant',
    defaultTextTypography: 'sans',
    defaultTributeMode: 'flower',
    defaultBlockOrder: [
      'profile',   // verrouillé — hero immersif
      'gallery',
      'text',      // verrouillé — récit
      'gouts',
      'quote',
      'messages',
      'family',
      'links',
      'contribute',
      'candle',
      'location',
    ],
    lockedBlocks: ['profile', 'text'],
  },
  {
    id: 'heritage-transmission',
    label: 'Transmission patrimoniale',
    tagline: 'Structure éditoriale documentaire, nuit cinématographique, ancrage des objets.',
    communTypes: ['memoire-objet', 'transmission-familiale'],
    exampleSlug: 'transmettre-jean-jacques',
    exampleTitle: 'Jean-Jacques Martin — Transmettre',
    defaultVisualTheme: 'night-cinematic',
    defaultWritingStyle: 'narratif-patrimonial',
    defaultTextTypography: 'serif',
    defaultTributeMode: 'none',
    defaultBlockOrder: [
      'profile',   // verrouillé — hero document/objet
      'text',      // verrouillé — récit
      'family',
      'gallery',
      'quote',
      'gouts',
      'location',
      'messages',
      'links',
      'contribute',
      'candle',
    ],
    lockedBlocks: ['profile', 'text'],
  },
];

export function getFinalTemplate(id: CompositionModelId): FinalTemplate {
  return FINAL_TEMPLATES.find((t) => t.id === id) ?? FINAL_TEMPLATES[0];
}

export function getLockedBlocks(id: CompositionModelId): BlockType[] {
  return getFinalTemplate(id).lockedBlocks;
}
