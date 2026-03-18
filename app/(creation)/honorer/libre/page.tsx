import { redirect } from 'next/navigation';
import { buildLegacyJourneyPath } from '@/lib/journeys';

export default function HonorerLibrePage() {
  redirect(buildLegacyJourneyPath('honorer', 'libre'));
}
