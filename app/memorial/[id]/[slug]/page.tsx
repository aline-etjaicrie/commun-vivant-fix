import { redirect } from 'next/navigation';

export default function LegacySlugPage({ params }: { params: { id: string; slug: string } }) {
  redirect(`/memorial/${params.id}/preview`);
}
