'use client';

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import AlmaChat from '@/components/AlmaChat';
import { Home } from 'lucide-react';
import { isIsolatedCreationFlow } from '@/lib/almaQuestionnaireIsolation';
import { resolveCommunType, getAlmaContextForCommunType } from '@/lib/communTypes';

function AlmaContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const communType = resolveCommunType(searchParams);
  const rawContext = searchParams?.get('context') || 'funeral';
  const isolated = isIsolatedCreationFlow(searchParams);
  const heritageType = searchParams?.get('heritageType');

  // Map to Alma context using the central commun type config.
  let context: 'funeral' | 'living_story' | 'object_memory' | 'feter' | 'transmettre' | 'honorer' =
    getAlmaContextForCommunType(communType);
  if (rawContext === 'heritage' && heritageType === 'object') {
    context = 'object_memory';
  }
  const name = searchParams?.get('name') || undefined;
  const birthDate = searchParams?.get('birthDate');
  const deathDate = searchParams?.get('deathDate');
  const genre = (searchParams?.get('genre') as 'Elle' | 'Il' | 'Sans genre spécifié') || undefined;

  const calculateAge = (start?: string | null, end?: string | null) => {
    if (!start) return undefined;
    const startDate = new Date(start);
    const endDate = end ? new Date(end) : new Date();
    let age = endDate.getFullYear() - startDate.getFullYear();
    const m = endDate.getMonth() - startDate.getMonth();
    if (m < 0 || (m === 0 && endDate.getDate() < startDate.getDate())) {
      age--;
    }
    return age;
  };

  const [userName, setUserName] = useState<string | undefined>(undefined);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.user_metadata?.name) {
        setUserName(user.user_metadata.name);
      }
      setLoadingUser(false);
    };
    fetchUser();
  }, []);

  const age = calculateAge(birthDate, deathDate);

  return (
    <div className="h-screen flex flex-col bg-memoir-bg">
      {/* Header */}
      <div className="bg-white border-b border-memoir-blue/10 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button
            onClick={() => {
              if (confirm('Voulez-vous vraiment quitter ? Votre conversation sera sauvegardée.')) {
                router.push('/');
              }
            }}
            className="flex items-center gap-2 text-memoir-blue/60 hover:text-memoir-blue transition-colors"
          >
            <Home className="w-4 h-4" />
            <span className="text-sm">Retour à l'accueil</span>
          </button>

          <div className="text-center flex-1">
            <h1 className="text-xl font-bold text-memoir-blue">Et j'ai crié – Mémoire</h1>
          </div>

          <div className="w-32"></div> {/* Spacer pour centrer le titre */}
        </div>
      </div>

      {/* Alma Chat pleine hauteur */}
      <div className="flex-1 overflow-hidden">
        <div className="max-w-7xl mx-auto h-full">
          <AlmaChat
            context={context}
            genre={genre}
            subjectName={name}
            age={age}
            userName={userName}
            storageNamespace={isolated ? 'dev' : undefined}
            previewPath={isolated ? '/alma-dev/apercu' : '/alma/apercu'}
            questionnairePath={isolated ? '/questionnaire-dev' : '/create/questionnaire'}
            communType={communType}
          />
        </div>
      </div>
    </div>
  );
}

export default function AlmaPage() {
  return (
    <Suspense fallback={
      <div className="h-screen flex items-center justify-center bg-memoir-bg">
        <div className="animate-spin w-8 h-8 border-4 border-memoir-gold border-t-transparent rounded-full" />
      </div>
    }>
      <AlmaContent />
    </Suspense>
  );
}
