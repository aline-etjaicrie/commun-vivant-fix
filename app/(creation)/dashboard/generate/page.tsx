'use client';

import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AlertCircle, ArrowLeft, Sparkles } from 'lucide-react';
import {
  STORAGE_KEYS,
  getFinalizationRaw,
  getQuestionnaireDataRaw,
} from '@/lib/creationFlowStorage';
import { buildGenerationRequestData } from '@/lib/buildGenerationRequestData';
import { getLegacyContextForCommunType, resolveCommunTypeFromContext } from '@/lib/communTypes';
import { resolveCommunTypeFromPayload } from '@/lib/almaProfiles';
import { getWritingStyle, resolveWritingStyle } from '@/lib/compositionStudio';
import { ensureDraftMemory } from '@/lib/client/draftMemory';
import { buildMemoryFallbackText } from '@/lib/memoryFallbackText';
import { resolveSensitiveJourneyCopy } from '@/lib/sensitiveJourneyCopy';
import { createClient } from '@/lib/supabase/client';
import { getValidateUrl } from '@/lib/validateUrl';

const supabase = createClient();

export default function StableGeneratePage() {
  return (
    <Suspense fallback={<GeneratePageFallback />}>
      <StableGeneratePageContent />
    </Suspense>
  );
}

function GeneratePageFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#F5F4F2] to-white p-6">
      <div className="w-full max-w-2xl rounded-2xl border border-[#C9A24D]/30 bg-white p-8 text-center shadow-xl">
        <Sparkles className="mx-auto mb-4 h-10 w-10 text-[#C9A24D]" />
        <h1 className="text-3xl italic text-[#0F2A44]">Préparation...</h1>
        <p className="mt-2 text-gray-600">Chargement des données de génération.</p>
      </div>
    </div>
  );
}

function StableGeneratePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const memoryId = searchParams?.get('memoryId') || localStorage.getItem(STORAGE_KEYS.currentMemorialId) || '';
  const redirectTimerRef = useRef<number | null>(null);

  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');
  const [canGenerate, setCanGenerate] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const prepared = useMemo(() => {
    const safeParse = (raw: string | null) => {
      if (!raw) return null;
      try {
        return JSON.parse(raw);
      } catch {
        return null;
      }
    };

    const finalization = safeParse(getFinalizationRaw());
    const flow = safeParse(localStorage.getItem(STORAGE_KEYS.creationFlow));
    const media = safeParse(localStorage.getItem(STORAGE_KEYS.mediaData));
    const previewData = safeParse(localStorage.getItem('memorialPreviewData'));
    const qDataRaw = getQuestionnaireDataRaw();
    const questionnaireRaw = safeParse(qDataRaw);
    const questionnaire = finalization?.source === 'alma' ? finalization : questionnaireRaw;

    const context = finalization?.context || flow?.context || localStorage.getItem(STORAGE_KEYS.context) || 'funeral';
    const communType = finalization?.communType
      ? resolveCommunTypeFromPayload(finalization.communType)
      : resolveCommunTypeFromContext(context);

    return { context, communType, questionnaire, media, previewData };
  }, []);

  useEffect(() => {
    setCanGenerate(Boolean(memoryId && (prepared.questionnaire || prepared.media)));
  }, [memoryId, prepared]);

  useEffect(() => {
    return () => {
      if (redirectTimerRef.current && typeof window !== 'undefined') {
        window.clearTimeout(redirectTimerRef.current);
      }
    };
  }, []);

  const activeCopy = resolveSensitiveJourneyCopy({
    context: prepared.context,
    communType: prepared.communType,
  });
  const selectedWritingStyle = getWritingStyle(
    resolveWritingStyle(
      prepared.previewData?.writingStyle || prepared.previewData?.style || prepared.questionnaire?.writingStyle || prepared.questionnaire?.style,
      prepared.communType
    )
  );

  const redirectToValidate = (nextMemoryId: string) => {
    const target = getValidateUrl(nextMemoryId);
    localStorage.setItem(STORAGE_KEYS.currentMemorialId, nextMemoryId);
    router.push(target);

    if (typeof window === 'undefined') return;

    if (redirectTimerRef.current) {
      window.clearTimeout(redirectTimerRef.current);
    }

    redirectTimerRef.current = window.setTimeout(() => {
      if (`${window.location.pathname}${window.location.search}` !== target) {
        window.location.assign(target);
      }
    }, 1200);
  };

  const handleGenerate = async () => {
    if (!memoryId) return;
    setIsGenerating(true);
    setErrorMessage('');
    setProgress(10);
    setStatus(activeCopy.generatePreparing);

    const questionnaire = prepared.questionnaire || {};
    const context = prepared.context || 'funeral';
    const communType = prepared.communType || 'deces';
    const requestData = buildGenerationRequestData({
      questionnaire,
      media: prepared.media,
      previewData: prepared.previewData,
      context,
      communType,
    });

    try {
      const parseJsonResponse = async (response: Response) => {
        const raw = await response.text();
        if (!raw) return null;
        try {
          return JSON.parse(raw);
        } catch {
          return { error: raw.trim() || 'Réponse serveur illisible' };
        }
      };

      setProgress(45);
      setStatus(activeCopy.generateInProgress);
      const draft = await ensureDraftMemory({
        memoryId,
        context,
        communType,
        questionnaire: requestData,
        media: prepared.media,
        finalization: {
          context,
          communType,
          writingStyle: requestData.writingStyle,
          style: requestData.style,
          visualTheme: requestData.visualTheme,
          compositionModel: requestData.compositionModel,
          textTypography: requestData.textTypography,
          tributeMode: requestData.tributeMode,
        },
      });
      const { data } = await supabase.auth.getSession();
      const authToken = data.session?.access_token;
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 18000);
      const res = await fetch('/api/generate-memorial', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        },
        signal: controller.signal,
        body: JSON.stringify({
          memoryId: draft.memoryId,
          draftToken: draft.draftToken,
          data: requestData,
        }),
      });
      clearTimeout(timeout);

      const payload = await parseJsonResponse(res);
      if (!res.ok) {
        throw new Error(payload?.error || 'Erreur de génération');
      }
      if (!payload?.text || !String(payload.text).trim()) {
        throw new Error('Le texte n’a pas pu être généré pour le moment.');
      }

      setProgress(90);
      setStatus(activeCopy.generateFinishing);
      localStorage.setItem(STORAGE_KEYS.generatedMemorialText, payload.text || '');
      setProgress(100);
      redirectToValidate(draft.memoryId);
    } catch (error: any) {
      console.warn('Generation IA indisponible, fallback local utilisé', error);
      const fallbackText = buildMemoryFallbackText({
        ...questionnaire,
        context,
        communType,
      });
      localStorage.setItem(STORAGE_KEYS.generatedMemorialText, fallbackText);
      setProgress(100);
      setStatus(activeCopy.generateFinishing);
      redirectToValidate(memoryId);
    }
  };

  if (!canGenerate) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F4F2] p-6">
        <div className="max-w-xl rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center">
          <h1 className="text-xl font-semibold text-amber-900">{activeCopy.missingDataTitle}</h1>
          <p className="mt-2 text-amber-800">{activeCopy.missingDataBody}</p>
          <button
            onClick={() => router.push(`/create/questionnaire?communType=${encodeURIComponent(prepared.communType)}&context=${encodeURIComponent(getLegacyContextForCommunType(prepared.communType))}`)}
            className="mt-4 rounded-lg bg-amber-700 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-800"
          >
            Reprendre le questionnaire
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#F5F4F2] to-white p-6">
      <div className="w-full max-w-2xl rounded-2xl border border-[#C9A24D]/30 bg-white p-8 shadow-xl">
        <div className="text-center">
          <Sparkles className="mx-auto mb-4 h-10 w-10 text-[#C9A24D]" />
          <h1 className="text-3xl italic text-[#0F2A44]">{activeCopy.generateTitle}</h1>
          <p className="mt-2 text-gray-600">{activeCopy.generateSubtitle}</p>
        </div>

        {isGenerating ? (
          <div className="mt-8">
            <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200">
              <div className="h-full bg-gradient-to-r from-[#C9A24D] to-[#E1C97A]" style={{ width: `${progress}%` }} />
            </div>
            <p className="mt-3 text-center text-sm text-gray-600">{status}</p>
          </div>
        ) : (
          <div className="mt-8 text-center">
            <button
              onClick={handleGenerate}
              className="rounded-xl bg-gradient-to-r from-[#C9A24D] to-[#E1C97A] px-8 py-3 font-semibold text-white hover:shadow-lg"
            >
              Lancer la première version
            </button>
            <p className="mt-3 text-sm text-gray-500">
              Ton choisi : {selectedWritingStyle.label}. Les souvenirs déjà partagés par vos proches seront aussi pris en compte quand ils enrichissent le récit.
            </p>
          </div>
        )}

        {!!errorMessage && !isGenerating && (
          <div className="mt-6 rounded-2xl border border-[#E7D9C8] bg-[#FFF9F5] p-5 text-left">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 text-[#C06A3A]" />
              <div>
                <h2 className="text-base font-semibold text-[#7A3F1E]">{activeCopy.generationErrorTitle}</h2>
                <p className="mt-1 text-sm text-[#7A3F1E]/80">{errorMessage}</p>
              </div>
            </div>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={handleGenerate}
                className="rounded-xl bg-[#0F2A44] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0A2035]"
              >
                Relancer la première version
              </button>
              <button
                onClick={() => router.push('/medias')}
                className="rounded-xl border border-[#D7D1C8] px-4 py-2 text-sm font-medium text-[#0F2A44] hover:border-[#BDAA8B]"
              >
                <span className="inline-flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Revenir aux médias
                </span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
