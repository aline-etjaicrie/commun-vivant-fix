import JourneyMethods from '@/components/create/JourneyMethods';
import { buildLegacyJourneyPath, getCreationJourney } from '@/lib/journeys';

export default function FeterPage() {
  const journey = getCreationJourney('feter');

  return (
    <JourneyMethods
      communType={journey.communType}
      almaHref={buildLegacyJourneyPath(journey.id, 'alma')}
      questionnaireHref={buildLegacyJourneyPath(journey.id, 'questionnaire')}
      libreHref={buildLegacyJourneyPath(journey.id, 'libre')}
      backHref="/create"
      backLabel="Voir les autres parcours"
    />
  );
}
