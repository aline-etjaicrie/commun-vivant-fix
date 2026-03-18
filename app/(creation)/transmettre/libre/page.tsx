import { redirect } from 'next/navigation';
import { buildLegacyJourneyPath } from '@/lib/journeys';

export default function TransmettreLibrePage() {
  redirect(buildLegacyJourneyPath('transmettre', 'libre'));
}
