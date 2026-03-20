import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { PublicMemorialRenderer, PublicUnavailablePage } from '@/components/public/PublicMemorialRenderer';
import { resolvePublicMemorial, trackMemoryVisit } from '@/lib/publicMemorials';

export const revalidate = 0;

export default async function PublicB2BPage(props: {
  params: Promise<{ slug: string; memorySlug: string }>;
  searchParams: Promise<{ ref?: string }>;
}) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const agencySlug = decodeURIComponent(params.slug || '');
  const memorySlug = decodeURIComponent(params.memorySlug || '');

  const resolved = await resolvePublicMemorial({ memorySlug, agencySlug });

  if (resolved.status === 'not_found') return notFound();
  if (resolved.status === 'unpublished') {
    return (
      <PublicUnavailablePage
        title="Cet espace n'est pas encore publie"
        message="Le memorial est en brouillon ou archive."
        agencyName={agencySlug}
      />
    );
  }
  if (resolved.status === 'suspended') {
    return (
      <PublicUnavailablePage
        title="Cet espace est temporairement indisponible"
        message="Merci de contacter l'agence."
        agencyName={agencySlug}
      />
    );
  }
  if (resolved.status === 'access_restricted') {
    return (
      <PublicUnavailablePage
        title="Accès restreint"
        message="Ce mémorial n'est pas accessible publiquement pour le moment. Son accès sera configuré par la personne responsable."
        agencyName={agencySlug}
      />
    );
  }
  if (resolved.status === 'access_pending') {
    return (
      <PublicUnavailablePage
        title="Accès en attente"
        message="Ce mémorial a bien été préparé, mais son mode d'accès n'a pas encore été confirmé."
        agencyName={agencySlug}
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
