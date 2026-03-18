import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { PublicMemorialRenderer, PublicUnavailablePage } from '@/components/public/PublicMemorialRenderer';
import { resolvePublicMemorial, trackMemoryVisit } from '@/lib/publicMemorials';

export const revalidate = 0;

export default async function PublicB2CPage(props: {
  params: Promise<{ memorySlug: string }>;
  searchParams: Promise<{ ref?: string }>;
}) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const memorySlug = decodeURIComponent(params.memorySlug || '');

  const resolved = await resolvePublicMemorial({ memorySlug });

  if (resolved.status === 'not_found') return notFound();
  if (resolved.status === 'unpublished') {
    return (
      <PublicUnavailablePage
        title="Cet espace n'est pas encore publie"
        message="Le memorial est en brouillon ou archive."
      />
    );
  }
  if (resolved.status === 'suspended') {
    return (
      <PublicUnavailablePage
        title="Cet espace est temporairement indisponible"
        message="Merci de contacter l'agence ou la famille."
      />
    );
  }

  const h = await headers();
  await trackMemoryVisit({
    memoryId: resolved.memory.id,
    agencyId: resolved.agency?.id || null,
    ref: searchParams?.ref || 'direct',
    userAgent: h.get('user-agent'),
  });

  return <PublicMemorialRenderer memory={resolved.memory} agency={resolved.agency} mode={resolved.routeMode} />;
}
