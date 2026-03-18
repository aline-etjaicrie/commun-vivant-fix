import { redirect } from 'next/navigation';
import { buildLegacyJourneyPath } from '@/lib/journeys';

export default function FeterQuestionnairePage() {
  redirect(buildLegacyJourneyPath('feter', 'questionnaire'));
}
