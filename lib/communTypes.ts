export type CommunType =
  | 'deces'
  | 'hommage-vivant'
  | 'transmission-familiale'
  | 'memoire-objet'
  | 'pro-ceremonie';

export type LegacyContext = 'funeral' | 'celebration' | 'heritage' | 'object_memory' | 'living_story';
export type AlmaContext = 'funeral' | 'living_story' | 'object_memory' | 'feter' | 'transmettre' | 'honorer';

export interface CommunTypeConfig {
  id: CommunType;
  title: string;
  subtitle: string;
  description: string;
  legacyContext: LegacyContext;
  almaContext: AlmaContext;
  category: 'public' | 'pro';
}

export const COMMUN_TYPES: CommunTypeConfig[] = [
  {
    id: 'deces',
    title: 'Honorer une mémoire',
    subtitle: 'Mémorial public pour un proche disparu',
    description: "Un espace digne et apaisé pour raconter une vie et rassembler les hommages.",
    legacyContext: 'funeral',
    almaContext: 'honorer',
    category: 'public',
  },
  {
    id: 'hommage-vivant',
    title: 'Fêter un vivant',
    subtitle: 'Anniversaire, retraite, gratitude',
    description: "Un commun positif pour célébrer une personne vivante.",
    legacyContext: 'celebration',
    almaContext: 'feter',
    category: 'public',
  },
  {
    id: 'transmission-familiale',
    title: 'Transmettre une histoire familiale',
    subtitle: 'Parcours généalogique et récit de transmission',
    description: "Conserver les repères familiaux, les anecdotes et les valeurs à transmettre.",
    legacyContext: 'heritage',
    almaContext: 'transmettre',
    category: 'public',
  },
  {
    id: 'memoire-objet',
    title: 'Mémoire d\'objet',
    subtitle: 'Objet, lieu, patrimoine affectif',
    description: "Donner une voix à un objet ou un lieu porteur de mémoire.",
    legacyContext: 'object_memory',
    almaContext: 'object_memory',
    category: 'public',
  },
  {
    id: 'pro-ceremonie',
    title: 'Texte de cérémonie (Pro)',
    subtitle: 'Assistant rédaction pour pompes funèbres',
    description: "Aider les professionnels à rédiger des textes de cérémonie avec tact et structure.",
    legacyContext: 'funeral',
    almaContext: 'honorer',
    category: 'pro',
  },
];

export function isCommunType(value: string): value is CommunType {
  return COMMUN_TYPES.some((item) => item.id === value);
}

const LEGACY_TO_COMMUN: Record<string, CommunType> = {
  funeral: 'deces',
  celebration: 'hommage-vivant',
  heritage: 'transmission-familiale',
  object_memory: 'memoire-objet',
  living_story: 'hommage-vivant',
  honorer: 'deces',
  feter: 'hommage-vivant',
  transmettre: 'transmission-familiale',
};

export function resolveCommunTypeFromContext(context?: string | null): CommunType {
  if (context && LEGACY_TO_COMMUN[context]) {
    return LEGACY_TO_COMMUN[context];
  }
  return 'deces';
}

export function getCommunTypeConfig(id: CommunType): CommunTypeConfig {
  return COMMUN_TYPES.find((item) => item.id === id) || COMMUN_TYPES[0];
}

export function resolveCommunType(params?: { get: (key: string) => string | null } | null): CommunType {
  const fromCommunType = params?.get('communType') as CommunType | null;
  if (fromCommunType && isCommunType(fromCommunType)) {
    return fromCommunType;
  }

  const fromContext = params?.get('context');
  if (fromContext && LEGACY_TO_COMMUN[fromContext]) {
    return LEGACY_TO_COMMUN[fromContext];
  }

  const fromType = params?.get('type');
  if (fromType && LEGACY_TO_COMMUN[fromType]) {
    return LEGACY_TO_COMMUN[fromType];
  }

  return 'deces';
}

export function getLegacyContextForCommunType(id: CommunType): LegacyContext {
  return getCommunTypeConfig(id).legacyContext;
}

export function getAlmaContextForCommunType(id: CommunType): AlmaContext {
  return getCommunTypeConfig(id).almaContext;
}

export function buildCommunQuery(id: CommunType): string {
  const context = getLegacyContextForCommunType(id);
  return `communType=${encodeURIComponent(id)}&context=${encodeURIComponent(context)}`;
}
