'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, Sparkles, Briefcase } from 'lucide-react';
import JourneyMethods from '@/components/create/JourneyMethods';
import { isAlmaQuestionnaireIsolationEnabled } from '@/lib/featureFlags';
import {
  COMMUN_TYPES,
  buildCommunQuery,
  getLegacyContextForCommunType,
  resolveCommunType,
} from '@/lib/communTypes';
import { buildJourneyPath, findCreationJourneyByCommunType } from '@/lib/journeys';

const COVER_BY_TYPE: Record<string, string> = {
  deces: '/photo-roman-kraft-unsplash.jpg',
  'hommage-vivant': '/bave-pictures-eQhaGaMBIg8-unsplash.jpg',
  'transmission-familiale': '/sofatutor-4syO0fP1Bf0-unsplash.jpg',
  'memoire-objet': '/meuble.jpg',
  'pro-ceremonie': '/hero-path.jpg',
};

function MethodSelectionContent() {
  const searchParams = useSearchParams();
  const useIsolatedFlow = isAlmaQuestionnaireIsolationEnabled();
  const hasSelection = !!searchParams?.get('communType') || !!searchParams?.get('context');

  if (!hasSelection) {
    return (
      <div className="min-h-screen bg-memoir-bg py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12 text-center">
            <Link href="/" className="inline-flex items-center text-memoir-blue/40 hover:text-memoir-blue transition-colors mb-6 text-sm font-bold uppercase tracking-widest">
              <ChevronLeft className="w-4 h-4 mr-1" />
              Retour a l'accueil
            </Link>
            <h1 className="text-3xl md:text-5xl font-serif italic text-memoir-blue leading-tight mb-4">
              Quel type de commun voulez-vous creer ?
            </h1>
            <p className="text-memoir-blue/60 text-lg font-light">
              Cinq parcours distincts: quatre publics et un professionnel pompes funebres.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {COMMUN_TYPES.map((item) => {
              const journey = findCreationJourneyByCommunType(item.id);

              return (
                <Link
                  key={item.id}
                  href={journey ? buildJourneyPath(journey.id) : `/create?${buildCommunQuery(item.id)}`}
                  className="group bg-white rounded-[28px] overflow-hidden border border-memoir-blue/10 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col"
                >
                  <div className="relative h-44 w-full overflow-hidden">
                    <Image
                      src={COVER_BY_TYPE[item.id] || '/photo-roman-kraft-unsplash.jpg'}
                      alt={item.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-6 flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-memoir-blue/60 text-xs uppercase tracking-widest font-bold">
                      {item.category === 'pro' ? <Briefcase className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
                      <span>{item.category === 'pro' ? 'Parcours Pro' : 'Parcours Public'}</span>
                    </div>
                    <h3 className="text-2xl font-serif italic text-memoir-blue">{item.title}</h3>
                    <p className="text-memoir-blue/60 text-sm leading-relaxed">{item.description}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  const communType = resolveCommunType(searchParams);
  const journey = findCreationJourneyByCommunType(communType);
  const isProCeremony = communType === 'pro-ceremonie';
  const context = searchParams?.get('context') || getLegacyContextForCommunType(communType);

  const almaHref = journey
    ? buildJourneyPath(journey.id, 'alma')
    : useIsolatedFlow
      ? `/alma-dev?context=${context}&communType=${communType}&isolated=1`
      : `/create/alma?context=${context}&communType=${communType}`;
  const questionnaireHref = journey
    ? buildJourneyPath(journey.id, 'questionnaire')
    : useIsolatedFlow
      ? `/questionnaire-dev?context=${context}&communType=${communType}&isolated=1`
      : `/create/questionnaire?context=${context}&communType=${communType}`;
  const libreHref = journey ? buildJourneyPath(journey.id, 'libre') : `/create/libre?context=${context}&communType=${communType}`;
  const solennHref = '/solenn';

  return (
    <JourneyMethods
      communType={communType}
      almaHref={isProCeremony ? solennHref : almaHref}
      questionnaireHref={questionnaireHref}
      libreHref={libreHref}
      backHref="/create"
      backLabel="Changer de type de commun"
    />
  );
}

export default function CreatePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-memoir-bg">Chargement...</div>}>
      <MethodSelectionContent />
    </Suspense>
  );
}
