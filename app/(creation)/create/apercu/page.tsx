'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowRight, Edit3, Loader2, RefreshCw, Sparkles } from 'lucide-react';
import { useBetaAccess } from '@/lib/client/betaAccess';

const MAX_REGENERATIONS = 3;

function buildSyntheticConversation(questionnaire: Record<string, any>): Array<{ role: 'user' | 'assistant'; content: string }> {
  const parts: string[] = [];

  const identite = questionnaire?.identite || {};
  const prenom = identite?.prenom || questionnaire?.prenom || '';
  const nom = identite?.nom || questionnaire?.nom || '';
  const name = [prenom, nom].filter(Boolean).join(' ');

  if (name) parts.push(`La personne (ou le sujet) s'appelle : ${name}`);

  const caractere = questionnaire?.caractere?.adjectifs;
  if (Array.isArray(caractere) && caractere.length > 0) {
    parts.push(`Traits de caractère : ${caractere.join(', ')}`);
  }

  const valeurs = questionnaire?.valeurs?.selected;
  if (Array.isArray(valeurs) && valeurs.length > 0) {
    parts.push(`Valeurs importantes : ${valeurs.join(', ')}`);
  }

  const gouts = questionnaire?.gouts || {};
  if (gouts.musique) parts.push(`Musique aimée : ${gouts.musique}`);
  if (gouts.lieu) parts.push(`Lieu significatif : ${gouts.lieu}`);
  if (gouts.phrase) parts.push(`Citation ou phrase : "${gouts.phrase}"`);
  if (gouts.saison) parts.push(`Saison préférée : ${gouts.saison}`);

  const talents = questionnaire?.talents || {};
  if (talents.carriere) parts.push(`Métier ou carrière : ${talents.carriere}`);
  if (talents.passions) parts.push(`Passions : ${talents.passions}`);

  const liens = questionnaire?.liens || {};
  if (liens.personnesQuiComptent) parts.push(`Personnes importantes : ${liens.personnesQuiComptent}`);

  if (questionnaire?.resume) parts.push(`Résumé : ${questionnaire.resume}`);

  return [{ role: 'user', content: parts.join('\n') || 'Aucune information fournie.' }];
}

function ApercuContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isBeta = useBetaAccess();

  const communType = searchParams?.get('communType') || 'deces';
  const context = searchParams?.get('context') || 'funeral';

  const [teaserText, setTeaserText] = useState('');
  const [subjectName, setSubjectName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [regenerationCount, setRegenerationCount] = useState(0);
  const [error, setError] = useState('');

  const generatePreview = async (questionnaire: Record<string, any>) => {
    const identite = questionnaire?.identite || {};
    const prenom = identite?.prenom || questionnaire?.prenom || '';
    const nom = identite?.nom || questionnaire?.nom || '';
    const name = [prenom, nom].filter(Boolean).join(' ') || 'cette personne';
    const style = questionnaire?.style || 'sobre';

    const apiContext =
      context === 'funeral' ? 'funeral'
      : communType === 'memoire-objet' ? 'object_memory'
      : 'living_story';

    const conversation = buildSyntheticConversation(questionnaire);

    const res = await fetch('/api/generate-preview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        conversation,
        context: apiContext,
        subjectName: name,
        genre: 'Sans genre spécifié',
        style,
      }),
    });

    if (!res.ok) throw new Error('Génération échouée');
    const data = await res.json();
    return { text: data.previewText as string, name };
  };

  useEffect(() => {
    const cached = localStorage.getItem('alma_teaser_text');
    const raw = localStorage.getItem('questionnaireData');
    const questionnaire = raw ? JSON.parse(raw) : null;

    const identite = questionnaire?.identite || {};
    const prenom = identite?.prenom || questionnaire?.prenom || '';
    const nom = identite?.nom || questionnaire?.nom || '';
    const name = [prenom, nom].filter(Boolean).join(' ');
    setSubjectName(name);

    if (cached) {
      setTeaserText(cached);
      setIsLoading(false);
      return;
    }

    if (!questionnaire) {
      router.push('/create');
      return;
    }

    generatePreview(questionnaire)
      .then(({ text, name: n }) => {
        setTeaserText(text);
        setSubjectName(n);
        localStorage.setItem('alma_teaser_text', text);
      })
      .catch(() => {
        // Fallback : résumé du questionnaire
        const fallback = questionnaire?.resume || questionnaire?.message?.content || '';
        if (fallback) {
          setTeaserText(fallback);
          localStorage.setItem('alma_teaser_text', fallback);
        } else {
          setError("Impossible de générer l'aperçu. Vérifiez votre connexion et réessayez.");
        }
      })
      .finally(() => setIsLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRegenerate = async () => {
    if (regenerationCount >= MAX_REGENERATIONS || isRegenerating) return;
    setIsRegenerating(true);
    setError('');

    try {
      const raw = localStorage.getItem('questionnaireData');
      const questionnaire = raw ? JSON.parse(raw) : null;
      if (!questionnaire) return;

      const { text } = await generatePreview(questionnaire);
      setTeaserText(text);
      localStorage.setItem('alma_teaser_text', text);
      setRegenerationCount((c) => c + 1);
    } catch {
      setError('La régénération a échoué. Réessayez dans un instant.');
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleContinue = () => {
    if (isBeta) {
      router.push('/medias');
    } else {
      router.push(`/checkout?context=${encodeURIComponent(context)}&communType=${encodeURIComponent(communType)}`);
    }
  };

  const handleModify = () => {
    localStorage.removeItem('alma_teaser_text');
    router.push(`/create/questionnaire?context=${encodeURIComponent(context)}&communType=${encodeURIComponent(communType)}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F4F2]">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-[#C9A24D]" />
          <p className="text-sm text-[#5E6B78]">Génération de votre aperçu…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F4F2] py-12 px-4">
      {isBeta && (
        <div className="mx-auto mb-6 max-w-3xl rounded-xl border border-[#2B5F7D]/20 bg-[#EFF5F9] px-4 py-2 text-center text-xs text-[#2B5F7D]">
          Mode BETA — accès test activé
        </div>
      )}

      <div className="mx-auto max-w-3xl">
        {/* En-tête */}
        <div className="mb-10 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#C9A24D]/10 px-4 py-2">
            <Sparkles className="h-4 w-4 text-[#C9A24D]" />
            <span className="text-sm font-medium text-[#0F2A44]">✨ Aperçu généré par l'IA</span>
          </div>
          <h1 className="mb-3 font-serif text-3xl text-[#0F2A44] md:text-4xl">
            Voilà ce que ça pourrait donner…
          </h1>
          {subjectName && (
            <p className="text-lg text-[#5E6B78]">Pour {subjectName}</p>
          )}
        </div>

        {/* Carte aperçu */}
        {teaserText ? (
          <div className="mb-6 rounded-[28px] border border-[#C9A24D]/20 bg-white p-8 shadow-xl md:p-12">
            <p
              className="text-lg leading-8 text-[#0F2A44] whitespace-pre-wrap"
              style={{ fontFamily: 'var(--font-serif, Georgia, serif)' }}
            >
              {teaserText}
            </p>
            <div className="mt-8 border-t border-[#C9A24D]/10 pt-6">
              <p className="text-center text-sm italic text-[#9E9585]">
                Ceci n'est qu'un début… Le texte complet sera bien plus riche.
              </p>
            </div>
          </div>
        ) : error ? (
          <div className="mb-6 rounded-[28px] border border-red-100 bg-red-50 p-8 text-center text-sm text-red-700">
            {error}
          </div>
        ) : null}

        {/* Régénérer */}
        <div className="-mt-2 mb-8 flex justify-center">
          <button
            type="button"
            onClick={handleRegenerate}
            disabled={isRegenerating || regenerationCount >= MAX_REGENERATIONS}
            className="flex items-center gap-2 text-sm text-[#5E6B78] hover:text-[#C9A24D] transition-colors disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isRegenerating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            {regenerationCount >= MAX_REGENERATIONS
              ? 'Limite atteinte (3/3)'
              : `Régénérer (${MAX_REGENERATIONS - regenerationCount} restant${MAX_REGENERATIONS - regenerationCount > 1 ? 's' : ''})`}
          </button>
        </div>

        {/* Promesses après paiement */}
        <div className="mb-8 rounded-[24px] border border-[#E7E1D7] bg-white p-6">
          <h2 className="mb-4 flex items-center gap-2 font-semibold text-[#0F2A44]">
            <Edit3 className="h-5 w-5 text-[#C9A24D]" />
            Ça vous plaît ?
          </h2>
          <ul className="space-y-3 text-sm text-[#5E6B78]">
            {[
              'Modifier le texte librement',
              'Régénérer jusqu\'à 3 fois',
              'Choisir l\'ambiance visuelle et les couleurs',
              'Ajouter photos, musique, liens',
              'QR code PDF offert',
            ].map((promise) => (
              <li key={promise} className="flex items-start gap-2">
                <span className="mt-0.5 text-[#C9A24D]">✓</span>
                <span>{promise}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* CTAs */}
        <div className="flex flex-col gap-4 sm:flex-row">
          <button
            type="button"
            onClick={handleModify}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border-2 border-[#0F2A44] px-6 py-4 font-medium text-[#0F2A44] transition hover:bg-[#0F2A44] hover:text-white"
          >
            <RefreshCw className="h-5 w-5" />
            Modifier mes réponses
          </button>

          <button
            type="button"
            onClick={handleContinue}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#C9A24D] px-6 py-4 font-medium text-white shadow-lg transition hover:bg-[#B8913C]"
          >
            Ça me plaît, je continue
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>

        <p className="mt-6 text-center text-xs text-[#9E9585]">
          Paiement sécurisé · Satisfaction garantie · Support 7j/7
        </p>
      </div>
    </div>
  );
}

export default function ApercuPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#F5F4F2]">
          <Loader2 className="h-8 w-8 animate-spin text-[#C9A24D]" />
        </div>
      }
    >
      <ApercuContent />
    </Suspense>
  );
}
