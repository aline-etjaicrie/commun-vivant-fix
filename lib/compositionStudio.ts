import type { CommunType } from '@/lib/communTypes';
import type { TemplateConfig } from '@/lib/templates';

export type CompositionModelId =
  | 'portrait-sensitive'
  | 'memory-album'
  | 'heritage-transmission';

export type VisualThemeId =
  | 'memorial-soft'
  | 'night-cinematic'
  | 'celebration-vivid';

export type WritingStyleId =
  | 'sobre-digne'
  | 'sensible-poetique'
  | 'chaleureux-familial'
  | 'lumineux-celebrant'
  | 'narratif-patrimonial';

export interface CompositionModelConfig {
  id: CompositionModelId;
  label: string;
  description: string;
  ratioLabel: string;
  bestFor: string;
  signature: string;
  previewSections: [string, string, string];
}

export interface VisualThemeConfig {
  id: VisualThemeId;
  label: string;
  description: string;
  badge: string;
  preview: {
    from: string;
    via: string;
    to: string;
  };
  colors: {
    bg: string;
    surface: string;
    text: string;
    textSecondary: string;
    accent: string;
    accentSoft: string;
    border: string;
  };
}

export interface WritingStyleConfig {
  id: WritingStyleId;
  label: string;
  description: string;
  example: string;
  promptVoice: string;
  promptRhythm: string;
  promptImagery: string;
  promptAvoid: string;
}

export const COMPOSITION_MODELS: CompositionModelConfig[] = [
  {
    id: 'portrait-sensitive',
    label: 'Portrait sensible',
    description: 'Un hommage centré sur la personne, la lecture et la respiration du récit.',
    ratioLabel: 'Texte au premier plan',
    bestFor: 'Mémorials, hommages sobres, récits intimes',
    signature: 'Grand portrait, récit ample, gestes d’hommage discrets et respiration littéraire.',
    previewSections: ['Portrait', 'Récit principal', 'Gestes d’hommage'],
  },
  {
    id: 'memory-album',
    label: 'Album de souvenirs',
    description: 'Un rendu plus immersif, rythmé par les images, les citations et les souvenirs.',
    ratioLabel: 'Images et récit en équilibre',
    bestFor: 'Anniversaires, hommages vivants, célébrations familiales',
    signature: 'Hero immersif, galerie vivante, citations et contributions qui rythment la page.',
    previewSections: ['Hero immersif', 'Galerie', 'Souvenirs et voix'],
  },
  {
    id: 'heritage-transmission',
    label: 'Transmission patrimoniale',
    description: 'Une mise en page éditoriale pour transmettre repères, documents et continuités.',
    ratioLabel: 'Structure documentaire et récit',
    bestFor: 'Mémoire d’objet, arbre familial, patrimoine et transmission',
    signature: 'Récit structuré, repères familiaux, documents et ressources mis en valeur.',
    previewSections: ['Ouverture éditoriale', 'Repères', 'Documents et ressources'],
  },
];

export const VISUAL_THEMES: VisualThemeConfig[] = [
  {
    id: 'memorial-soft',
    label: 'Sobre et mémoriel',
    description: 'Pierre claire, lumière douce, élégance retenue.',
    badge: 'Digne et intemporel',
    preview: {
      from: '#F8F3EC',
      via: '#FCFAF6',
      to: '#EEE5D7',
    },
    colors: {
      bg: '#F6F1EA',
      surface: '#FCFAF6',
      text: '#1F2B35',
      textSecondary: '#6E6A63',
      accent: '#A27C53',
      accentSoft: '#E8D7C1',
      border: '#D9CCBC',
    },
  },
  {
    id: 'night-cinematic',
    label: 'Bleu nuit et cinématographique',
    description: 'Encre profonde, halo doré, contraste feutré.',
    badge: 'Profond et premium',
    preview: {
      from: '#0C1322',
      via: '#17233A',
      to: '#273451',
    },
    colors: {
      bg: '#0E1626',
      surface: '#172135',
      text: '#F4EFE7',
      textSecondary: '#CDBFAE',
      accent: '#D4A96A',
      accentSoft: '#25324C',
      border: '#2E3D5B',
    },
  },
  {
    id: 'celebration-vivid',
    label: 'Festif et vivant',
    description: 'Couleurs franches, énergie lumineuse, rendu joyeux mais maîtrisé.',
    badge: 'Vivant et lumineux',
    preview: {
      from: '#FFF2F6',
      via: '#FFFFFF',
      to: '#FFF6DF',
    },
    colors: {
      bg: '#FFF7FB',
      surface: '#FFFFFF',
      text: '#1A2433',
      textSecondary: '#5C6673',
      accent: '#F04D74',
      accentSoft: '#FFE0E8',
      border: '#F4CAD6',
    },
  },
];

export const WRITING_STYLES: WritingStyleConfig[] = [
  {
    id: 'sobre-digne',
    label: 'Sobre et digne',
    description: 'Un ton retenu, clair et respectueux.',
    example: 'Une présence discrète, des gestes justes, une vie racontée sans emphase.',
    promptVoice: 'une écriture retenue, claire, précise et respectueuse, sans pathos appuyé',
    promptRhythm: 'des phrases maîtrisées, une progression simple, peu d’effets, beaucoup de justesse',
    promptImagery: 'des images sobres, concrètes, ancrées dans les gestes, les habitudes et la présence',
    promptAvoid: 'les envolées lyriques, les formules trop funéraires, les métaphores excessives',
  },
  {
    id: 'sensible-poetique',
    label: 'Sensible et poétique',
    description: 'Une voix imagée, délicate, sans grandiloquence.',
    example: 'Des images douces, une lumière intérieure, des traces qui continuent d’accompagner.',
    promptVoice: 'une écriture délicate, sensible, imagée, mais toujours tenue et crédible',
    promptRhythm: 'des phrases souples, un peu plus amples, avec un souffle contemplatif',
    promptImagery: 'des images de lumière, de matière, de gestes et d’atmosphère, sans surcharge',
    promptAvoid: 'le cliché poétique, les grandes déclarations abstraites, le ton mystique ou emphatique',
  },
  {
    id: 'chaleureux-familial',
    label: 'Chaleureux et familial',
    description: 'Une voix proche, simple, tissée de liens.',
    example: 'Les repas, les habitudes, les phrases, les présences qui faisaient maison.',
    promptVoice: 'une écriture proche, incarnée, simple, très humaine, centrée sur les liens',
    promptRhythm: 'des phrases fluides et naturelles, comme une parole adressée à la famille',
    promptImagery: 'des scènes du quotidien, des repas, des habitudes, des attentions et des présences',
    promptAvoid: 'le ton administratif, trop cérémoniel, ou au contraire trop familier',
  },
  {
    id: 'lumineux-celebrant',
    label: 'Lumineux et célébrant',
    description: 'Un ton vivant, reconnaissant, tourné vers l’élan.',
    example: 'Un récit qui célèbre une énergie, une joie, une manière d’être au monde.',
    promptVoice: 'une écriture vive, lumineuse, reconnaissante, tournée vers ce qui met en mouvement',
    promptRhythm: 'des paragraphes dynamiques, clairs, avec de l’élan et de la gratitude',
    promptImagery: 'des images d’énergie, de joie, de générosité, de présence et de partage',
    promptAvoid: 'le ton funéraire, la tristesse appuyée, les formulations trop solennelles',
  },
  {
    id: 'narratif-patrimonial',
    label: 'Narratif et patrimonial',
    description: 'Une écriture de transmission, structurée et incarnée.',
    example: 'Des repères, des gestes, des objets et des histoires qui passent d’une génération à l’autre.',
    promptVoice: 'une écriture structurée, incarnée, orientée transmission, mémoire et continuité',
    promptRhythm: 'des paragraphes construits, avec des repères nets et une narration posée',
    promptImagery: 'des objets, des documents, des lieux, des gestes et des repères de lignée',
    promptAvoid: 'le ton de fiche technique, l’abstraction froide, ou au contraire le lyrisme diffus',
  },
];

export function getCompositionModel(id: CompositionModelId): CompositionModelConfig {
  return COMPOSITION_MODELS.find((model) => model.id === id) || COMPOSITION_MODELS[0];
}

export function getVisualTheme(id: VisualThemeId): VisualThemeConfig {
  return VISUAL_THEMES.find((theme) => theme.id === id) || VISUAL_THEMES[0];
}

export function getWritingStyle(id: WritingStyleId): WritingStyleConfig {
  return WRITING_STYLES.find((style) => style.id === id) || WRITING_STYLES[0];
}

export function buildWritingStylePromptBlock(id: WritingStyleId): string {
  const style = getWritingStyle(id);

  return [
    `STYLE D'ECRITURE OBLIGATOIRE : ${style.label}.`,
    `Voix attendue : ${style.promptVoice}.`,
    `Rythme attendu : ${style.promptRhythm}.`,
    `Imagerie et matiere : ${style.promptImagery}.`,
    `A eviter absolument pour ce ton : ${style.promptAvoid}.`,
  ].join('\n');
}

export function getRecommendedCompositionModel(communType: CommunType): CompositionModelId {
  if (communType === 'hommage-vivant') return 'memory-album';
  if (communType === 'transmission-familiale' || communType === 'memoire-objet') {
    return 'heritage-transmission';
  }
  return 'portrait-sensitive';
}

export function getRecommendedVisualTheme(communType: CommunType): VisualThemeId {
  if (communType === 'hommage-vivant') return 'celebration-vivid';
  if (communType === 'transmission-familiale' || communType === 'memoire-objet') {
    return 'night-cinematic';
  }
  return 'memorial-soft';
}

export function getRecommendedWritingStyle(communType: CommunType): WritingStyleId {
  if (communType === 'hommage-vivant') return 'lumineux-celebrant';
  if (communType === 'transmission-familiale' || communType === 'memoire-objet') {
    return 'narratif-patrimonial';
  }
  return 'sobre-digne';
}

export function resolveCompositionModel(value: unknown, communType: CommunType): CompositionModelId {
  const normalized = String(value || '').trim();
  if (normalized === 'portrait-sensitive' || normalized === 'memory-album' || normalized === 'heritage-transmission') {
    return normalized;
  }
  if (normalized === 'classic') return 'portrait-sensitive';
  if (normalized === 'magazine') return 'memory-album';
  if (normalized === 'editorial') return 'heritage-transmission';
  return getRecommendedCompositionModel(communType);
}

export function resolveVisualTheme(value: unknown, communType: CommunType): VisualThemeId {
  const normalized = String(value || '').trim();
  if (normalized === 'memorial-soft' || normalized === 'night-cinematic' || normalized === 'celebration-vivid') {
    return normalized;
  }
  if (normalized === 'deces-nocturne' || normalized === 'bleu-dore' || normalized === 'transmission-lignee') {
    return 'night-cinematic';
  }
  if (normalized === 'vivant-festif' || normalized === 'vivant-pop' || normalized === 'deces-lumiere') {
    return 'celebration-vivid';
  }
  return getRecommendedVisualTheme(communType);
}

export function resolveWritingStyle(value: unknown, communType: CommunType): WritingStyleId {
  const normalized = String(value || '').trim();
  if (
    normalized === 'sobre-digne' ||
    normalized === 'sensible-poetique' ||
    normalized === 'chaleureux-familial' ||
    normalized === 'lumineux-celebrant' ||
    normalized === 'narratif-patrimonial'
  ) {
    return normalized;
  }
  if (normalized === 'sobre') return 'sobre-digne';
  if (normalized === 'poetique') return 'sensible-poetique';
  if (normalized === 'chaleureux') return 'chaleureux-familial';
  if (normalized === 'narratif') {
    return communType === 'transmission-familiale' || communType === 'memoire-objet'
      ? 'narratif-patrimonial'
      : 'chaleureux-familial';
  }
  return getRecommendedWritingStyle(communType);
}

export function buildThemeTemplate(themeId: VisualThemeId, communType: CommunType): TemplateConfig {
  const theme = getVisualTheme(themeId);

  return {
    id: `studio-${theme.id}`,
    communType,
    name: theme.label,
    typography: theme.id === 'night-cinematic' ? 'sans-serif' : 'serif',
    colors: {
      bg: theme.colors.bg,
      text: theme.colors.text,
      accent: theme.colors.accent,
      textSecondary: theme.colors.textSecondary,
    },
    fonts: {
      heading:
        theme.id === 'celebration-vivid'
          ? 'font-serif italic tracking-tight'
          : theme.id === 'night-cinematic'
            ? 'font-serif tracking-tight'
            : 'font-serif tracking-normal',
      body:
        theme.id === 'night-cinematic'
          ? 'font-normal leading-relaxed'
          : 'font-serif leading-loose',
    },
    spacing: {
      section: 'mb-24',
      block: 'mb-14',
    },
  };
}

export function getLegacyTemplateIdForVisualTheme(
  themeId: VisualThemeId,
  communType: CommunType
): string {
  if (themeId === 'night-cinematic') {
    if (communType === 'deces') return 'deces-nocturne';
    if (communType === 'hommage-vivant') return 'vivant-pop';
    if (communType === 'transmission-familiale') return 'transmission-lignee';
    if (communType === 'memoire-objet') return 'objet-epure';
    return 'pro-ceremonial';
  }

  if (themeId === 'celebration-vivid') {
    if (communType === 'hommage-vivant') return 'vivant-festif';
    if (communType === 'memoire-objet') return 'objet-epure';
    if (communType === 'transmission-familiale') return 'transmission-lignee';
    if (communType === 'pro-ceremonie') return 'pro-sobre';
    return 'deces-lumiere';
  }

  if (communType === 'hommage-vivant') return 'vivant-carnet';
  if (communType === 'transmission-familiale') return 'transmission-archive';
  if (communType === 'memoire-objet') return 'objet-atelier';
  if (communType === 'pro-ceremonie') return 'pro-lectern';
  return 'deces-dignite';
}

export function getLegacyLayoutIdForCompositionModel(modelId: CompositionModelId): string {
  if (modelId === 'memory-album') return 'magazine';
  if (modelId === 'heritage-transmission') return 'editorial';
  return 'classic';
}

export function isLightVisualTheme(themeId: VisualThemeId): boolean {
  return themeId !== 'night-cinematic';
}

export function hexToRgba(hex: string, alpha: number): string {
  const cleaned = hex.replace('#', '').trim();
  const normalized = cleaned.length === 3
    ? cleaned
        .split('')
        .map((char) => `${char}${char}`)
        .join('')
    : cleaned;

  const int = Number.parseInt(normalized, 16);
  if (Number.isNaN(int) || normalized.length !== 6) {
    return `rgba(0, 0, 0, ${alpha})`;
  }

  const r = (int >> 16) & 255;
  const g = (int >> 8) & 255;
  const b = int & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
