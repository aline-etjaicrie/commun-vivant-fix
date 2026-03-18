import { redirect } from 'next/navigation';

type AlmaEntryPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AlmaEntryPage({ searchParams }: AlmaEntryPageProps) {
  const resolvedSearchParams = (await searchParams) || {};
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(resolvedSearchParams)) {
    if (Array.isArray(value)) {
      value.forEach((v) => query.append(key, String(v)));
    } else if (value !== undefined) {
      query.set(key, String(value));
    }
  }
  const suffix = query.toString();
  redirect(suffix ? `/create/alma?${suffix}` : '/create/alma');
}
