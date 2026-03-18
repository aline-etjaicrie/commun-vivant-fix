import { redirect } from 'next/navigation';

export default async function CreationEntryPage({
  searchParams,
}: {
  searchParams: Promise<{ agency?: string; type?: string }>;
}) {
  const { agency, type } = await searchParams;
  const mappedType = type || 'honorer';

  const q = new URLSearchParams();
  q.set('type', mappedType);
  if (agency) q.set('agency', agency);

  redirect(`/create/method?${q.toString()}`);
}
