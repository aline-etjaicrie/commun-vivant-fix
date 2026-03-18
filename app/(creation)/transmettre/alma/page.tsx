import { redirect } from 'next/navigation';
import { buildLegacyJourneyPath } from '@/lib/journeys';

export default function TransmettreAlmaPage() {
  redirect(buildLegacyJourneyPath('transmettre', 'alma'));
}
