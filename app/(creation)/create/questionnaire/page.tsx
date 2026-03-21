'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getSteps } from './steps';
import { QuestionnaireData } from '@/lib/schema';
import Progress from '@/components/Progress';
import StepComponent from '@/components/Step';
import { ChevronLeft, ChevronRight, Home, Sparkles, Loader2 } from 'lucide-react';
import {
  getAlmaPrefillStorageKey,
  getQuestionnaireDraftStorageKey,
  getQuestionnaireFinalStorageKey,
  isIsolatedCreationFlow,
} from '@/lib/almaQuestionnaireIsolation';
import {
  buildFinalizationPayloadFromQuestionnaire,
  persistFinalizationPayload,
} from '@/lib/memorialFinalizationAdapter';
import {
  getCommunTypeConfig,
  resolveCommunType,
  getLegacyContextForCommunType,
} from '@/lib/communTypes';
import { STORAGE_KEYS, clearPreviousCreationFlow } from '@/lib/creationFlowStorage';
import { ensureDraftMemory } from '@/lib/client/draftMemory';

function QuestionnaireContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const communType = resolveCommunType(searchParams);
  const context = (searchParams?.get('context') as string) || getLegacyContextForCommunType(communType);
  const isPremium = searchParams?.get('premium') === 'true';
  const isIsolated = isIsolatedCreationFlow(searchParams);
  const questionnaireDraftStorageKey = getQuestionnaireDraftStorageKey(context, isIsolated, communType);
  const questionnaireFinalStorageKey = getQuestionnaireFinalStorageKey(isIsolated);
  const almaPrefillStorageKey = getAlmaPrefillStorageKey(isIsolated);
  const communConfig = getCommunTypeConfig(communType);
  const communLabel = communConfig.title;

  const [almaPrefill, setAlmaPrefill] = useState<any>(null);

  const [stepIndex, setStepIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [saveStatus, setSaveStatus] = useState('Réponses enregistrées automatiquement.');
  const saveStatusTimeoutRef = useRef<number | null>(null);
  const [data, setData] = useState<Partial<QuestionnaireData>>({
    identite: { prenom: '' },
    photoProfil: {},
    style: null,
    caractere: { adjectifs: [] },
    valeurs: { selected: [] },
    liens: { personnes: '' },
    talents: {},
    gouts: {},
    musiqueAudio: {},
    galerie: { photos: [] },
    message: { hasMessage: false },
    medias: [],
    liensWeb: [],
  });

  // Nettoyer les données d'un ancien parcours si on démarre un nouveau (pas une reprise)
  useEffect(() => {
    const isResume = searchParams?.get('resume') === 'true';
    const hasMemorialId = Boolean(searchParams?.get('memorialId'));
    if (!isResume && !hasMemorialId) {
      clearPreviousCreationFlow();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Vérifier si on vient d'Alma
    const prefill = localStorage.getItem(almaPrefillStorageKey);
    if (prefill) {
      try {
        const prefillData = JSON.parse(prefill);
        setAlmaPrefill(prefillData);

        // Pré-remplir les champs connus (adapter selon la structure de data)
        setData(prev => ({
          ...prev,
          identite: {
            ...prev.identite,
            prenom: prefillData.firstname || prev.identite?.prenom || ''
          },
          // Si d'autres champs peuvent être mappés, les ajouter ici
        }));

        // Nettoyer pour ne pas re-pré-remplir si on revient
        localStorage.removeItem(almaPrefillStorageKey);
      } catch (e) {
        console.error('Erreur lecture prefill Alma');
      }
    }
  }, [almaPrefillStorageKey]);

  // Pass data to getSteps to allow dynamic steps (e.g. based on heritageType)
  // If NOT premium, use teaser mode (true)
  const steps = getSteps(context, data, !isPremium, communType);

  const currentStep = steps[stepIndex];
  const isFirstStep = stepIndex === 0;
  const isLastStep = stepIndex === steps.length - 1;
  const currentStepNumber = stepIndex + 1;
  const nextStep = !isLastStep ? steps[stepIndex + 1] : null;
  const estimatedDuration = steps.length <= 5 ? '5 min' : '5 à 10 min';

  useEffect(() => {
    return () => {
      if (saveStatusTimeoutRef.current && typeof window !== 'undefined') {
        window.clearTimeout(saveStatusTimeoutRef.current);
      }
    };
  }, []);

  // Charger les données depuis localStorage au montage
  useEffect(() => {
    // Separate storage key per context to avoid mixing data
    const saved = localStorage.getItem(questionnaireDraftStorageKey);
    if (saved) {
      try {
        const parsedData = JSON.parse(saved);
        setData(parsedData);

        // Auto-resume logic: find first incomplete step
        // We only do this on initial load if we are in premium mode or coming back
        if (isPremium) {
          const resumeSteps = getSteps(context, parsedData, !isPremium, communType);
          const firstIncompleteIndex = resumeSteps.findIndex(step => {
            // Basic check: if step id is 'identite', check if prenom exists
            if (step.id === 'identite') return !parsedData.identite?.prenom;
            if (step.id === 'style') return !parsedData.style;
            if (step.id === 'caractere') return !parsedData.caractere?.adjectifs?.length;
            if (step.id === 'valeurs') return !parsedData.valeurs?.selected?.length;
            if (step.id === 'message') return !parsedData.resume;
            // If we reach premium steps and they are empty, we stop here
            if (['galerie', 'famille', 'talents', 'fierte', 'gouts', 'dateDecesStep', 'messageLibre'].includes(step.id)) return true;
            return false;
          });

          if (firstIncompleteIndex !== -1 && firstIncompleteIndex > 0) {
            setStepIndex(firstIncompleteIndex);
          }
        }
      } catch (e) {
        console.error('Erreur lors du chargement des données sauvegardées');
      }
    }
  }, [communType, context, isPremium, questionnaireDraftStorageKey]);

  const handleChange = (field: string, value: any) => {
    setData((prev) => {
      const keys = field.split('.');
      let newData;

      if (keys.length === 1) {
        newData = { ...prev, [field]: value };
      } else {
        const [parent, child] = keys;
        newData = {
          ...prev,
          [parent]: {
            ...(prev[parent as keyof QuestionnaireData] as any),
            [child]: value,
          },
        };
      }

      // Sauvegarde automatique à chaque changement
      localStorage.setItem(questionnaireDraftStorageKey, JSON.stringify(newData));
      setSaveStatus('Enregistré');
      if (typeof window !== 'undefined') {
        if (saveStatusTimeoutRef.current) {
          window.clearTimeout(saveStatusTimeoutRef.current);
        }
        saveStatusTimeoutRef.current = window.setTimeout(() => {
          setSaveStatus('Réponses enregistrées automatiquement.');
        }, 1600);
      }
      return newData;
    });
  };

  const handleNext = () => {
    if (!isLastStep) {
      setStepIndex((i) => i + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevious = () => {
    if (!isFirstStep) {
      setStepIndex((i) => i - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Calcule un score de richesse du contenu (0–100)
  const computeCompleteness = (): number => {
    let score = 0;
    if (data.identite?.prenom) score += 25;
    const adjectifs = data.caractere?.adjectifs || [];
    score += Math.min(adjectifs.length * 10, 20);
    const valeurs = data.valeurs?.selected || [];
    score += Math.min(valeurs.length * 8, 20);
    if (data.talents?.passions || data.talents?.talent) score += 15;
    if (data.liens?.personnes) score += 10;
    if (data.resume) score += 10;
    return Math.min(score, 100);
  };

  // Vérifie qu'il y a assez de matière pour générer un texte fidèle
  const hasMinimalContent = (): boolean => {
    if (!data.identite?.prenom) return false;
    const hasCaractere = (data.caractere?.adjectifs || []).length > 0;
    const hasValeurs = (data.valeurs?.selected || []).length > 0;
    const hasContext = !!(data.resume || data.liens?.personnes || data.talents?.passions);
    return hasCaractere || hasValeurs || hasContext;
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    if (!hasMinimalContent()) {
      setSubmitError("Ajoutez au moins un prénom et quelques éléments (traits de caractère ou valeurs) pour générer une base fidèle.");
      return;
    }
    setSubmitError('');
    setIsSubmitting(true);
    // Sauvegarder les données du questionnaire
    localStorage.setItem(questionnaireFinalStorageKey, JSON.stringify(data));
    localStorage.setItem(STORAGE_KEYS.context, context);
    localStorage.setItem(
      STORAGE_KEYS.creationFlow,
      JSON.stringify({
        source: 'questionnaire',
        context,
        communType,
        updatedAt: new Date().toISOString(),
      })
    );
    persistFinalizationPayload(
      buildFinalizationPayloadFromQuestionnaire(data, context, communType),
      isIsolated
    );

    // Prépare un brouillon mémoire puis poursuit vers les médias.
    // La vraie génération doit arriver après les images pour produire un texte complet.
    try {
      const draft = await ensureDraftMemory({
        memoryId: localStorage.getItem(STORAGE_KEYS.currentMemorialId) || '',
        context,
        communType,
        questionnaire: data,
        finalization: buildFinalizationPayloadFromQuestionnaire(data, context, communType),
      });
      localStorage.setItem(STORAGE_KEYS.currentMemorialId, draft.memoryId);

      if (isIsolated) {
        router.push(`/questionnaire-dev/finalisation?context=${context}&communType=${communType}`);
      } else {
        // Effacer le teaser précédent pour forcer une nouvelle génération
        localStorage.removeItem('alma_teaser_text');
        router.push(`/create/apercu?context=${encodeURIComponent(context)}&communType=${encodeURIComponent(communType)}`);
      }
    } catch (error) {
      console.error('Preparation brouillon/aperçu impossible', error);
      if (isIsolated) {
        router.push(`/questionnaire-dev/finalisation?context=${context}&communType=${communType}`);
      } else {
        localStorage.removeItem('alma_teaser_text');
        router.push(`/create/apercu?context=${encodeURIComponent(context)}&communType=${encodeURIComponent(communType)}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-memoir-bg py-8 md:py-12 px-4">
        <div className="max-w-4xl mx-auto">
          {/* En-tête */}
          <div className="text-center mb-6 md:mb-8">
            <button
              onClick={() => {
                if (confirm('Voulez-vous vraiment quitter ? Vos modifications non sauvegardées seront perdues.')) {
                  router.push('/');
                }
              }}
              className="inline-flex items-center gap-2 text-memoir-gold hover:text-memoir-gold/80 transition-colors mb-4"
            >
              <Home className="w-5 h-5" />
              <span className="text-sm font-medium">Retour à l’accueil</span>
            </button>
            <h1 className="text-3xl md:text-5xl font-bold text-memoir-blue mb-2 md:mb-4">
              {communConfig.title}
            </h1>
            <p className="text-memoir-blue/70 text-base md:text-lg">
              {communConfig.subtitle}
            </p>
          </div>

          <div className="bg-memoir-blue/5 border border-memoir-blue/10 rounded-xl p-3 mb-6 text-sm text-memoir-blue">
            Parcours choisi : <strong>{communLabel}</strong>. Ce choix sera conservé pour la suite.
          </div>

          {almaPrefill && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-memoir-gold mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium text-memoir-blue">
                  ALMA a préparé quelques éléments à relire avant de continuer.
                </p>
                <p className="text-xs text-memoir-blue/60 mt-1">
                  Vous gardez la main sur chaque réponse. Vérifiez simplement ce qui a été ajouté.
                </p>
              </div>
            </div>
          )}

          {isIsolated && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-sm text-amber-900">
              Mode isolé actif : ce questionnaire n’impacte pas le flux de finalisation en production.
            </div>
          )}

          <div className="mb-4 rounded-xl bg-white/80 px-4 py-3 text-sm text-memoir-blue shadow-sm border border-memoir-blue/10">
            <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
              <span><strong>Étape {currentStepNumber}</strong> sur {steps.length}</span>
              <span>Durée estimée : {estimatedDuration}</span>
              <span>
                Ensuite : {nextStep ? nextStep.title : 'Médias puis première version du texte'}
              </span>
            </div>
          </div>

          {/* Barre de progression */}
          <Progress current={currentStepNumber} total={steps.length} />

          {/* Indicateur de richesse du contenu — visible dès la 2e étape */}
          {stepIndex > 0 && (() => {
            const pct = computeCompleteness();
            const barColor = pct < 30 ? 'bg-red-400' : pct < 60 ? 'bg-amber-400' : 'bg-emerald-500';
            const barWidth = pct < 20 ? 'w-1/5' : pct < 40 ? 'w-2/5' : pct < 60 ? 'w-3/5' : pct < 80 ? 'w-4/5' : 'w-full';
            const label = pct < 30
              ? "Contenu encore léger — quelques éléments de plus amélioreront l'aperçu"
              : pct < 60
              ? 'Base présente — continuez pour un meilleur rendu'
              : pct < 80
              ? 'Bonne matière — aperçu personnalisé attendu'
              : 'Matière riche — excellent rendu attendu';
            return (
              <div className="mt-3 mb-2 px-1">
                <div className="flex justify-between items-center text-xs text-memoir-blue/50 mb-1.5">
                  <span className="font-semibold uppercase tracking-widest text-[10px]">Richesse du contenu</span>
                  <span className="italic">{label}</span>
                </div>
                <div className="h-1 bg-memoir-blue/10 rounded-full overflow-hidden">
                  <div className={`h-1 rounded-full transition-all duration-700 ${barColor} ${barWidth}`} />
                </div>
              </div>
            );
          })()}

          {/* Étape courante */}
          <div className="bg-white rounded-2xl shadow-lg p-6 md:p-12 mb-6 md:mb-8">
            <StepComponent step={currentStep} data={data} onChange={handleChange} />
          </div>

          {/* Avertissement contenu insuffisant (dernière étape) */}
          {submitError && isLastStep && (
            <div className="mb-4 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800 flex items-start gap-2">
              <span className="shrink-0">⚠️</span>
              <span>{submitError}</span>
            </div>
          )}

          {/* Cadrage avant génération (dernière étape, contenu OK) */}
          {isLastStep && !submitError && hasMinimalContent() && (
            <div className="mb-4 rounded-xl bg-memoir-blue/5 border border-memoir-blue/10 px-4 py-3 text-sm text-memoir-blue/70 italic text-center">
              L'IA va générer une première base à relire et enrichir — pas un texte final.
            </div>
          )}

          {/* Navigation */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 md:gap-4">
            <button
              onClick={handlePrevious}
              disabled={isFirstStep}
              className="btn-secondary flex items-center justify-center gap-2 order-1 md:order-1"
            >
              <ChevronLeft className="w-5 h-5" />
              <span className="inline">Précédent</span>
            </button>

            <p className="order-3 text-center text-xs md:order-2 md:text-sm text-memoir-blue/55">
              {saveStatus}
            </p>

            {isLastStep ? (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="btn-primary flex items-center justify-center gap-2 order-2 md:order-3 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <span>Préparation...</span>
                    <Loader2 className="w-5 h-5 animate-spin" />
                  </>
                ) : (
                  <>
                    <span>Continuer vers les médias</span>
                    <ChevronRight className="w-5 h-5" />
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="btn-primary flex items-center justify-center gap-2 order-2 md:order-3"
              >
                <span>Suivant</span>
                <ChevronRight className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>

    </>
  );
}

export default function QuestionnairePage() {
  return (
    <Suspense fallback={
      <div className="h-screen flex items-center justify-center bg-memoir-bg">
        <div className="animate-spin w-8 h-8 border-4 border-memoir-gold border-t-transparent rounded-full" />
      </div>
    }>
      <QuestionnaireContent />
    </Suspense>
  );
}
