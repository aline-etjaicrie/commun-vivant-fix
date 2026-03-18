'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Eye, Loader2, RefreshCcw, Save } from 'lucide-react';
import { resolveCommunTypeFromPayload } from '@/lib/almaProfiles';
import { type CommunType, resolveCommunTypeFromContext } from '@/lib/communTypes';
import {
  STORAGE_KEYS,
  getFinalizationRaw,
  getQuestionnaireDataRaw,
} from '@/lib/creationFlowStorage';
import {
  getDefaultTemplateIdForCommunType,
  getMemorialPreset,
  sanitizeBlockOrder,
} from '@/lib/memorialPresets';
import { safeParse, sanitizeGeneratedText, resolveIdentity } from '@/lib/memorialRuntime';
import { getTemplatesForCommunType } from '@/lib/templates';
import { buildMemoryFallbackText } from '@/lib/memoryFallbackText';
import { getValidateUrl } from '@/lib/validateUrl';

const DEFAULT_CUSTOM_COLORS = {
  bg: '#ffffff',
  text: '#1f2937',
  accent: '#C9A24D',
  textSecondary: '#6b7280',
};

type ValidateEditorPageProps = {
  memoryId: string;
};

export default function ValidateEditorPage({ memoryId }: ValidateEditorPageProps) {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [communType, setCommunType] = useState<CommunType>('deces');
  const [questionnaireData, setQuestionnaireData] = useState<any>(null);
  const [mediaData, setMediaData] = useState<any>(null);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [customColors, setCustomColors] = useState(DEFAULT_CUSTOM_COLORS);
  const [notice, setNotice] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isOpeningPreview, setIsOpeningPreview] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);

  const availableTemplates = useMemo(
    () => getTemplatesForCommunType(communType),
    [communType]
  );

  useEffect(() => {
    try {
      const questionnaire = safeParse<any>(getQuestionnaireDataRaw());
      const finalization = safeParse<any>(getFinalizationRaw());
      const flow = safeParse<any>(localStorage.getItem(STORAGE_KEYS.creationFlow));
      const previewData = safeParse<any>(localStorage.getItem('memorialPreviewData'));
      const media = safeParse<any>(localStorage.getItem(STORAGE_KEYS.mediaData));
      const storedText = localStorage.getItem(STORAGE_KEYS.generatedMemorialText);

      let detectedCommunType: CommunType = 'deces';

      if (previewData?.communType) {
        detectedCommunType = resolveCommunTypeFromPayload(previewData.communType);
      } else if (finalization?.communType) {
        detectedCommunType = resolveCommunTypeFromPayload(finalization.communType);
      } else if (questionnaire?.communType) {
        detectedCommunType = resolveCommunTypeFromPayload(questionnaire.communType);
      } else {
        detectedCommunType = resolveCommunTypeFromContext(
          previewData?.context || finalization?.context || flow?.context || questionnaire?.context
        );
      }

      const defaultTemplate = getDefaultTemplateIdForCommunType(detectedCommunType);
      const initialText = sanitizeGeneratedText(
        previewData?.texteGenere ||
          storedText ||
          questionnaire?.resume ||
          questionnaire?.message?.content ||
          ''
      );

      setQuestionnaireData(questionnaire);
      setMediaData(media || {});
      setCommunType(detectedCommunType);
      setSelectedTemplate(previewData?.template || defaultTemplate);
      setCustomColors(previewData?.customColors || DEFAULT_CUSTOM_COLORS);
      // Si rien n'a été généré, construis un fallback complet à partir du questionnaire/médias
      if (!initialText.trim()) {
        const fallbackText = buildMemoryFallbackText({
          ...questionnaire,
          medias: media,
          communType: detectedCommunType,
          context: finalization?.context || flow?.context || questionnaire?.context,
        });
        setText(fallbackText);
        localStorage.setItem(STORAGE_KEYS.generatedMemorialText, fallbackText);
      } else {
        setText(initialText);
      }
    } catch (error) {
      console.error('Erreur chargement validation', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const displayName = useMemo(() => {
    const identity = resolveIdentity(questionnaireData || {});
    return [identity?.prenom, identity?.nom].filter(Boolean).join(' ').trim();
  }, [questionnaireData]);

  const saveState = () => {
    const questionnaire = questionnaireData || {};
    const finalization = safeParse<any>(getFinalizationRaw());
    const flow = safeParse<any>(localStorage.getItem(STORAGE_KEYS.creationFlow));
    const preset = getMemorialPreset(communType);
    const identity = resolveIdentity(questionnaire);

    const data = {
      communType,
      context: finalization?.context || flow?.context || questionnaire?.context || undefined,
      identite: identity,
      occasion: questionnaire?.occasion || undefined,
      talents: questionnaire?.talents || undefined,
      liens: questionnaire?.liens || questionnaire?.liensVie || undefined,
      gouts: questionnaire?.gouts || undefined,
      medias: mediaData || {},
      texteGenere: sanitizeGeneratedText(text),
      template: selectedTemplate || getDefaultTemplateIdForCommunType(communType),
      customColors: selectedTemplate === 'custom' ? customColors : undefined,
      layout: preset.layout,
      blockOrder: sanitizeBlockOrder(preset.blockOrder),
      photoFilter: mediaData?.photoFilter || 'none',
      message: "Un espace pour célébrer la vie.",
      publishedAt: new Date().toISOString(),
    };

    const compactData = {
      ...data,
      medias: {
        ...(data.medias || {}),
        audioFile:
          typeof data?.medias?.audioFile === 'string' && data.medias.audioFile.startsWith('data:')
            ? null
            : data?.medias?.audioFile,
      },
    };

    localStorage.setItem(STORAGE_KEYS.generatedMemorialText, data.texteGenere);

    try {
      localStorage.setItem('memorialPreviewData', JSON.stringify(data));
    } catch (error) {
      console.warn('Quota localStorage atteint, sauvegarde compacte', error);
      localStorage.setItem('memorialPreviewData', JSON.stringify(compactData));
    }

    return data;
  };

  const handleSave = () => {
    setIsSaving(true);
    try {
      saveState();
      setNotice('Votre texte est bien enregistré. Vous pouvez poursuivre quand vous voulez.');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePreview = () => {
    setIsOpeningPreview(true);
    saveState();
    router.push(`/memorial/${encodeURIComponent(memoryId)}/preview`);
  };

  const handleRegenerate = () => {
    setIsRegenerating(true);
    router.push(`/dashboard/generate?memoryId=${encodeURIComponent(memoryId)}`);
  };

  const isBusy = isSaving || isOpeningPreview || isRegenerating;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F4F2] text-[#0F2A44]">
        Chargement de la relecture...
      </div>
    );
  }

  if (!memoryId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F4F2] p-6">
        <div className="max-w-xl rounded-3xl border border-[#E7E1D7] bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl italic text-[#0F2A44]">Impossible d’ouvrir cette relecture</h1>
          <p className="mt-3 text-sm text-gray-600">
            Il manque l’identifiant du mémorial. Reprenez la génération pour relancer le parcours
            proprement.
          </p>
          <Link
            href="/dashboard"
            className="mt-5 inline-flex rounded-xl bg-[#0F2A44] px-4 py-2 text-sm font-semibold text-white"
          >
            Retour au dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F5F4F2] to-white">
      <header className="sticky top-0 z-40 border-b border-[#C9A24D]/15 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link
            href={`/dashboard/${encodeURIComponent(memoryId)}`}
            className="inline-flex items-center gap-2 text-sm font-medium text-[#0F2A44] hover:text-[#C9A24D]"
          >
            <ChevronLeft className="h-4 w-4" />
            Retour au tableau de bord
          </Link>

          <div className="flex items-center gap-3">
            <button
              onClick={handleRegenerate}
              disabled={isBusy}
              className="inline-flex items-center gap-2 rounded-xl border border-[#D8D3CA] px-4 py-2 text-sm text-[#0F2A44] hover:border-[#C9A24D]/50 disabled:opacity-60"
            >
              {isRegenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCcw className="h-4 w-4" />}
              Relancer la generation
            </button>
            <button
              onClick={handlePreview}
              disabled={isBusy}
              className="inline-flex items-center gap-2 rounded-xl bg-[#0F2A44] px-4 py-2 text-sm font-semibold text-white hover:bg-[#173754] disabled:opacity-60"
            >
              {isOpeningPreview ? <Loader2 className="h-4 w-4 animate-spin" /> : <Eye className="h-4 w-4" />}
              Ouvrir l apercu complet
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10">
        <div className="mb-8">
          <h1 className="text-4xl italic text-[#0F2A44]">Relire et ajuster le texte</h1>
          <p className="mt-3 max-w-3xl text-base text-gray-600">
            Cette étape a été volontairement allégée pour rester fluide. L’important ici est de
            relire, corriger si besoin, puis ouvrir l’aperçu complet.
          </p>
          {displayName ? (
            <p className="mt-2 text-sm font-medium text-[#7A5A2E]">Personne concernée : {displayName}</p>
          ) : null}
        </div>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          <section className="rounded-3xl border border-[#E7E1D7] bg-white p-6 shadow-sm">
            <label className="mb-3 block text-sm font-semibold text-[#0F2A44]">
              Texte généré
            </label>
            <textarea
              value={text}
              onChange={(event) => {
                setText(event.target.value);
                if (notice) setNotice('');
              }}
              placeholder="Le texte apparaîtra ici. Vous pourrez le reprendre librement."
              className="min-h-[460px] w-full rounded-2xl border border-[#E5DED2] bg-[#FCFBF8] p-5 text-lg leading-8 text-[#0F2A44] outline-none transition focus:border-[#C9A24D]/50"
              style={{ fontFamily: 'Georgia, serif' }}
            />

            {notice ? (
              <div className="mt-4 rounded-2xl border border-[#D7EAD8] bg-[#F4FBF4] px-4 py-3 text-sm text-[#2F5B35]">
                {notice}
              </div>
            ) : null}

            {!text.trim() ? (
              <div className="mt-4 rounded-2xl border border-[#F0D9C8] bg-[#FFF7F1] px-4 py-3 text-sm text-[#8A4C25]">
                Le texte est vide pour l’instant. Vous pouvez revenir à la génération ou écrire une
                première base ici directement.
              </div>
            ) : null}

            <div className="mt-5 flex flex-wrap gap-3">
              <button
                onClick={handleSave}
                disabled={isBusy}
                className="inline-flex items-center gap-2 rounded-xl border border-[#C9A24D]/30 bg-[#FFF9EC] px-4 py-2 text-sm font-medium text-[#7A5A2E] hover:border-[#C9A24D]/60 disabled:opacity-60"
              >
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Enregistrer le texte
              </button>
              <button
                onClick={handlePreview}
                disabled={isBusy}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#C9A24D] to-[#E1C97A] px-5 py-2 text-sm font-semibold text-white disabled:opacity-60"
              >
                {isOpeningPreview ? <Loader2 className="h-4 w-4 animate-spin" /> : <Eye className="h-4 w-4" />}
                Ouvrir l apercu complet
              </button>
            </div>
          </section>

          <aside className="space-y-6">
            <section className="rounded-3xl border border-[#E7E1D7] bg-white p-6 shadow-sm">
              <h2 className="text-base font-semibold text-[#0F2A44]">Thème rapide</h2>
              <p className="mt-2 text-sm text-gray-600">
                On garde ici un choix simple pour éviter les blocages. La personnalisation fine peut
                venir après.
              </p>
              <div className="mt-4 space-y-2">
                {availableTemplates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => setSelectedTemplate(template.id)}
                    className={`flex w-full items-center gap-3 rounded-2xl border px-3 py-3 text-left transition ${
                      selectedTemplate === template.id
                        ? 'border-[#C9A24D] bg-[#FFF9EC]'
                        : 'border-[#ECE7DE] hover:border-[#D9C6A5]'
                    }`}
                  >
                    <span
                      className="h-10 w-10 rounded-full border"
                      style={{
                        backgroundColor:
                          template.id === 'custom' && selectedTemplate === 'custom'
                            ? customColors.bg
                            : template.colors.bg,
                        borderColor:
                          template.id === 'custom' && selectedTemplate === 'custom'
                            ? customColors.accent
                            : template.colors.accent,
                      }}
                    />
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium text-[#0F2A44]">
                        {template.name}
                      </span>
                      <span className="block text-xs text-gray-500">{template.id}</span>
                    </span>
                  </button>
                ))}
              </div>
            </section>

            <section className="rounded-3xl border border-[#E7E1D7] bg-white p-6 shadow-sm">
              <h2 className="text-base font-semibold text-[#0F2A44]">Suite conseillée</h2>
              <ol className="mt-3 space-y-3 text-sm text-gray-600">
                <li>1. Relire le texte et corriger ce qui sonne faux.</li>
                <li>2. Enregistrer si besoin.</li>
                <li>3. Ouvrir l’aperçu complet.</li>
                <li>4. Partager seulement quand tout te semble juste.</li>
              </ol>
              <Link
                href={getValidateUrl(memoryId)}
                className="mt-4 inline-flex text-xs text-[#7A5A2E] underline underline-offset-2"
              >
                Recharger cette étape proprement
              </Link>
            </section>
          </aside>
        </div>
      </main>
    </div>
  );
}
