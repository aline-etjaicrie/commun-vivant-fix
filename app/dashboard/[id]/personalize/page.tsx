import { redirect } from 'next/navigation';

export default async function PersonalizePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(`/dashboard/validate?memoryId=${id}`);
}
