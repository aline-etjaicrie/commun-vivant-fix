'use client';

import Link from 'next/link';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function QuestionnaireDevFinalisationContent() {
  const searchParams = useSearchParams();
  const context = searchParams?.get('context') || 'funeral';
  const communType = searchParams?.get('communType') || 'deces';

  return (
    <main className="min-h-screen bg-memoir-bg px-4 py-16">
      <div className="mx-auto max-w-2xl rounded-2xl border border-memoir-gold/20 bg-white p-8 shadow-sm">
        <h1 className="mb-4 text-3xl font-serif text-memoir-blue">Flux isole enregistre</h1>
        <p className="mb-6 text-memoir-blue/70">
          Les donnees Alma et questionnaire ont ete sauvegardees dans des cles dediees au mode dev.
          Le flux de finalisation production n'a pas ete modifie.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link href="/medias" className="btn-primary text-center">
            Tester la generation du memorial
          </Link>
          <Link href={`/alma-dev?context=${context}&communType=${communType}&isolated=1`} className="btn-secondary text-center">
            Retourner sur Alma dev
          </Link>
          <Link href={`/questionnaire-dev?context=${context}&communType=${communType}&isolated=1`} className="btn-secondary text-center">
            Modifier le questionnaire dev
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function QuestionnaireDevFinalisationPage() {
  return (
    <Suspense fallback={null}>
      <QuestionnaireDevFinalisationContent />
    </Suspense>
  );
}
