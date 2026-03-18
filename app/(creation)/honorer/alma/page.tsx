import { redirect } from 'next/navigation';
import { buildLegacyJourneyPath } from '@/lib/journeys';

export default function HonorerAlmaPage() {
  redirect(buildLegacyJourneyPath('honorer', 'alma'));
}
