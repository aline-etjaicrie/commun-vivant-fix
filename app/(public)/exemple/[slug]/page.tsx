import { notFound } from 'next/navigation';
import ExampleMemorialPage from '@/components/memorial/ExampleMemorialPage';
import { getExampleMemorialBySlug } from '@/lib/exampleMemorials';

export default async function ExempleDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const exemple = getExampleMemorialBySlug(slug);

  if (!exemple) {
    notFound();
  }

  return <ExampleMemorialPage example={exemple} />;
}
