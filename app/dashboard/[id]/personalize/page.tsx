import { redirect } from 'next/navigation';

export default function PersonalizePage({ params }: { params: { id: string } }) {
  redirect(`/dashboard/validate?memoryId=${params.id}`);
}
