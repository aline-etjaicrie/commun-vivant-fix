import { CommunType } from '@/lib/communTypes';

export interface AlmaProfile {
  id: CommunType;
  label: string;
  conversationalGoal: string;
  toneGuidelines: string;
  extractionFocus: string[];
  teaserGoal: string;
}

const DEFAULT_PROFILE: AlmaProfile = {
  id: 'deces',
  label: 'Alma Memorial',
  conversationalGoal:
    "Aider a construire un memorial public pour un proche disparu, avec un recit durable et digne.",
  toneGuidelines:
    "Doux, respectueux, precis, jamais larmoyant ni ceremoniel.",
  extractionFocus: [
    'identite',
    'lien',
    'anecdotes',
    'valeurs',
    'signe distinctif',
    'message final',
  ],
  teaserGoal:
    "Donner un extrait court, digne et evocateur qui ouvre sur la suite du recit.",
};

const PROFILES: Record<CommunType, AlmaProfile> = {
  deces: DEFAULT_PROFILE,
  'hommage-vivant': {
    id: 'hommage-vivant',
    label: 'Alma Celebration',
    conversationalGoal:
      "Aider a celebrer une personne vivante avec un texte chaleureux au present.",
    toneGuidelines:
      "Lumineux, vivant, concret, jamais superficiel.",
    extractionFocus: ['traits', 'moments joyeux', 'liens', 'reconnaissance', 'souhaits'],
    teaserGoal: "Faire ressentir l'energie de la personne et donner envie de lire le portrait complet.",
  },
  'transmission-familiale': {
    id: 'transmission-familiale',
    label: 'Alma Transmission',
    conversationalGoal:
      "Aider a transmettre une histoire familiale entre generations avec des reperes clairs.",
    toneGuidelines:
      "Pedagogique, sensible, ancre dans les faits et la memoire.",
    extractionFocus: ['reperes temporels', 'filiation', 'anecdotes de transmission', 'valeurs', 'heritage'],
    teaserGoal: "Montrer l'importance de la transmission sans tout reveler.",
  },
  'memoire-objet': {
    id: 'memoire-objet',
    label: 'Alma Objet',
    conversationalGoal:
      "Reveler l'histoire d'un objet ou d'un lieu affectif et ce qu'il transmet.",
    toneGuidelines:
      "Concret, sensoriel, precis, oriente patrimoine affectif.",
    extractionFocus: ['origine', 'matiere', 'usage', 'transmission', 'souvenirs lies'],
    teaserGoal: "Donner une premiere image forte de l'objet et de sa charge affective.",
  },
  'pro-ceremonie': {
    id: 'pro-ceremonie',
    label: 'Alma Ceremonie Pro',
    conversationalGoal:
      "Aider les pompes funebres a rediger un texte de ceremonie juste, humain et exploitable rapidement.",
    toneGuidelines:
      "Professionnel, empathique, sobre, operationnel et respectueux des familles.",
    extractionFocus: [
      'informations confiees par la famille',
      'contraintes ceremonie',
      'ton souhaite',
      'elements a eviter',
      'structure du texte',
    ],
    teaserGoal:
      "Fournir un extrait de ceremonie clair et digne, directement reutilisable comme base pro.",
  },
};

export function resolveCommunTypeFromPayload(input?: string | null): CommunType {
  if (!input) return 'deces';
  if (input in PROFILES) return input as CommunType;
  return 'deces';
}

export function getAlmaProfile(communType?: string | null): AlmaProfile {
  const resolved = resolveCommunTypeFromPayload(communType);
  return PROFILES[resolved] || DEFAULT_PROFILE;
}
