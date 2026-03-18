import { redirect } from 'next/navigation';
import { buildLegacyJourneyPath } from '@/lib/journeys';

export default function FeterLibrePage() {
  redirect(buildLegacyJourneyPath('feter', 'libre'));
}
