import { redirect } from 'next/navigation';
import { buildLegacyJourneyPath } from '@/lib/journeys';

export default function FeterAlmaPage() {
  redirect(buildLegacyJourneyPath('feter', 'alma'));
}
