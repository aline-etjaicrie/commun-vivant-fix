import { redirect } from 'next/navigation';

export default async function LegacySlugPage({ params }: { params: Promise<{ id: string; slug: string }> }) {
  const { id } = await params;
  redirect(`/memorial/${id}/preview`);
}
