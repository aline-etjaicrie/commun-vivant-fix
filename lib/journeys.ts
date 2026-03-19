import { getLegacyContextForCommunType, type CommunType } from '@/lib/communTypes';
import { isAlmaQuestionnaireIsolationEnabled } from '@/lib/featureFlags';

export type CreationJourneyId = 'feter' | 'transmettre' | 'honorer';
export type JourneyStep = 'entry' | 'questionnaire' | 'alma' | 'libre';

type JourneySearchValue = string | string[] | undefined;
export type JourneySearchParams = Record<string, JourneySearchValue>;

export interface CreationJourney {
  id: CreationJourneyId;
  communType: Extract<CommunType, 'hommage-vivant' | 'transmission-familiale' | 'deces'>;
  title: string;
  homeDescription: string;
  ctaLabel: string;
  image: string;
  color: 'gold' | 'neon' | 'blue';
}

export const CREATION_JOURNEYS: CreationJourney[] = [
  {
    id: 'feter',
    communType: 'hommage-vivant',
    title: 'Fêter',
    homeDescription:
      "Raconter l'histoire de quelqu'un pour célébrer une naissance, un anniversaire ou un départ à la retraite.",
    ctaLabel: 'Créer un espace de célébration',
    image: '/bave-pictures-eQhaGaMBIg8-unsplash.jpg',
    color: 'gold',
  },
  {
    id: 'transmettre',
    communType: 'transmission-familiale',
    title: 'Transmettre',
    homeDescription: 'Créer un espace pour transmettre une histoire familiale, des repères et des objets à léguer.',
    ctaLabel: 'Transmettre une mémoire',
    image: '/sofatutor-4syO0fP1Bf0-unsplash.jpg',
    color: 'neon',
  },
  {
    id: 'honorer',
    communType: 'deces',
    title: 'Honorer',
    homeDescription: "Rendre hommage à une personne disparue avec dignité et pudeur.",
    ctaLabel: 'Créer un mémorial',
    image: '/photo-roman-kraft-unsplash.jpg',
    color: 'blue',
  },
];

export function getCreationJourney(id: CreationJourneyId): CreationJourney {
  const journey = CREATION_JOURNEYS.find((item) => item.id === id);
  if (!journey) {
    throw new Error(`Unknown journey: ${id}`);
  }
  return journey;
}

export function findCreationJourneyByCommunType(communType: CommunType): CreationJourney | null {
  return CREATION_JOURNEYS.find((item) => item.communType === communType) || null;
}

export function buildJourneyPath(id: CreationJourneyId, step: JourneyStep = 'entry'): string {
  if (step === 'entry') {
    return `/${id}`;
  }

  return `/${id}/${step}`;
}

function appendSearchParams(params: URLSearchParams, searchParams: JourneySearchParams = {}): void {
  Object.entries(searchParams).forEach(([key, value]) => {
    if (value === undefined) return;

    if (Array.isArray(value)) {
      value.forEach((item) => params.append(key, item));
      return;
    }

    params.set(key, value);
  });
}

function withQuery(pathname: string, params: URLSearchParams): string {
  const query = params.toString();
  return query ? `${pathname}?${query}` : pathname;
}

export function buildLegacyJourneyPath(
  id: CreationJourneyId,
  step: JourneyStep = 'entry',
  searchParams: JourneySearchParams = {}
): string {
  const journey = getCreationJourney(id);
  const params = new URLSearchParams();

  appendSearchParams(params, searchParams);
  params.set('communType', journey.communType);
  params.set('context', getLegacyContextForCommunType(journey.communType));

  if (step === 'entry') {
    return withQuery('/create', params);
  }

  if (step === 'questionnaire') {
    if (isAlmaQuestionnaireIsolationEnabled()) {
      params.set('isolated', '1');
      return withQuery('/questionnaire-dev', params);
    }

    return withQuery('/create/questionnaire', params);
  }

  if (step === 'alma') {
    if (isAlmaQuestionnaireIsolationEnabled()) {
      params.set('isolated', '1');
      return withQuery('/alma-dev', params);
    }

    return withQuery('/create/alma', params);
  }

  return withQuery('/create/libre', params);
}
