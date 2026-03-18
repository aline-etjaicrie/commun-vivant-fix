import { notFound } from 'next/navigation';

export default async function ExempleDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // Exemples disponibles
  const exemples: Record<string, any> = {
    'transmettre-jean-jacques': {
      title: 'Jean-Jacques - Transmettre',
      type: 'Transmettre',
      description: 'Une histoire de vie et de patrimoine familial',
    },
    'feter-marie': {
      title: 'Marie - Fêter',
      type: 'Fêter',
      description: 'Un espace de célébration partagée',
    },
    'honorer-mina': {
      title: 'Mina - Honorer',
      type: 'Honorer',
      description: 'Un mémorial dédié avec dignité et pudeur',
    },
  };

  const exemple = exemples[slug];

  if (!exemple) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      <div className="max-w-7xl mx-auto px-6 py-20">
        <h1 className="text-5xl font-serif italic text-memoir-blue mb-4">
          {exemple.title}
        </h1>
        <p className="text-xl text-memoir-blue/60 mb-8">
          {exemple.description}
        </p>
        <div className="bg-white rounded-2xl p-12 shadow-lg border border-stone-100">
          <p className="text-lg text-memoir-blue/80">
            Exemple de mémoire - {exemple.type}
          </p>
        </div>
      </div>
    </div>
  );
}
