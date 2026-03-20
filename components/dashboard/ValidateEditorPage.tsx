'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ChevronLeft,
  ExternalLink,
  Eye,
  FileText,
  Heart,
  ImageIcon,
  Link2,
  Loader2,
  Music,
  Palette,
  Plus,
  RefreshCcw,
  Save,
  Sparkles,
  Trash2,
  Type,
} from 'lucide-react';
import SortableBlockEditor from '@/components/SortableBlockEditor';
import { type BlockType } from '@/lib/layouts';
import { FINAL_TEMPLATES, getFinalTemplate } from '@/lib/finalTemplates';
import { resolveCommunTypeFromPayload } from '@/lib/almaProfiles';
import {
  type CommunType,
  getCommunTypeConfig,
  resolveCommunTypeFromContext,
} from '@/lib/communTypes';
import {
  STORAGE_KEYS,
  getFinalizationRaw,
  getQuestionnaireDataRaw,
} from '@/lib/creationFlowStorage';
import {
  buildThemeTemplate,
  COMPOSITION_MODELS,
  getCompositionModel,
  getRecommendedCompositionModel,
  getLegacyLayoutIdForCompositionModel,
  getLegacyTemplateIdForVisualTheme,
  getVisualTheme,
  getWritingStyle,
  resolveCompositionModel,
  resolveVisualTheme,
  resolveWritingStyle,
  VISUAL_THEMES,
  WRITING_STYLES,
  type CompositionModelId,
  type VisualThemeId,
  type WritingStyleId,
} from '@/lib/compositionStudio';
import { getMemorialPreset, sanitizeBlockOrder } from '@/lib/memorialPresets';
import {
  applyTypographyPreference,
  ensureAbsoluteUrl,
  formatDisplayNamePart,
  formatIdentityForDisplay,
  resolveTypographyPreference,
  safeParse,
  sanitizeGeneratedText,
  type TextTypography,
  type TributeDisplayMode,
} from '@/lib/memorialRuntime';
import { buildMemoryFallbackText } from '@/lib/memoryFallbackText';
import { blobToURL, getPhoto } from '@/lib/indexedDB';
import PublishedMemorialRenderer from '@/components/memorial/PublishedMemorialRenderer';

const COLOR_PALETTES: Array<{
  id: string;
  name: string;
  primary: string;
  secondary: string;
  bg: string;
}> = [
  { id: 'navy-gold', name: 'Original', primary: '#0F2A44', secondary: '#C9A24D', bg: '#F5F4F2' },
  { id: 'forest', name: 'Nature', primary: '#2C5F2D', secondary: '#97BC62', bg: '#FAF9F7' },
  { id: 'slate', name: 'Pierre', primary: '#334155', secondary: '#94a3b8', bg: '#f8fafc' },
  { id: 'rose', name: 'Douceur', primary: '#8B3A52', secondary: '#D4A0B0', bg: '#FDF7F8' },
  { id: 'gold', name: 'Lumière', primary: '#7A5A2E', secondary: '#D4AF37', bg: '#FFFBF0' },
];

const PHOTO_FILTER_OPTIONS: Array<{
  id: string;
  label: string;
  css: string;
}> = [
  { id: 'none', label: 'Naturel', css: 'none' },
  { id: 'sepia', label: 'Sépia', css: 'sepia(60%)' },
  { id: 'bw', label: 'Noir & Blanc', css: 'grayscale(100%)' },
  { id: 'vintage', label: 'Vintage', css: 'sepia(30%) brightness(0.95) contrast(1.05)' },
];

const TEMPLATE_IMAGES: Record<string, string> = {
  'portrait-sensitive': '/capture-mina.png',
  'memory-album': '/marie-mini.png',
  'heritage-transmission': '/meuble.jpg',
};

const TYPOGRAPHY_OPTIONS: Array<{
  id: TextTypography;
  label: string;
  description: string;
}> = [
  { id: 'serif', label: 'Serif éditoriale', description: 'Pour une lecture littéraire, ample et posée.' },
  { id: 'sans', label: 'Sans raffinée', description: 'Pour une lecture plus directe, sobre et nette.' },
  { id: 'calligraphy', label: 'Manuscrite', description: 'Pour une présence plus personnelle et chaleureuse.' },
];

const TRIBUTE_OPTIONS: Array<{
  id: TributeDisplayMode;
  label: string;
  description: string;
}> = [
  { id: 'both', label: 'Bougie et fleurs', description: 'Les deux gestes d’hommage sont visibles.' },
  { id: 'candle', label: 'Bougie seulement', description: 'Seule la bougie est proposée.' },
  { id: 'flower', label: 'Fleurs seulement', description: 'Seule la fleur est proposée.' },
  { id: 'none', label: 'Aucun', description: 'Aucun geste visuel n’est affiché.' },
];

type EditableLink = {
  id: string;
  titre?: string;
  url?: string;
  description?: string;
};

type FamilyDraft = {
  story?: string;
  pdfUrl?: string;
  pdfName?: string;
  members?: Array<{ prenom?: string; nom?: string; role?: string; photoUrl?: string }>;
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
  const [textTypography, setTextTypography] = useState<TextTypography>('serif');
  const [tributeMode, setTributeMode] = useState<TributeDisplayMode>('both');
  const [compositionModel, setCompositionModel] = useState<CompositionModelId>('portrait-sensitive');
  const [visualTheme, setVisualTheme] = useState<VisualThemeId>('memorial-soft');
  const [writingStyle, setWritingStyle] = useState<WritingStyleId>('sobre-digne');
  const [liensWeb, setLiensWeb] = useState<EditableLink[]>([]);
  const [family, setFamily] = useState<FamilyDraft>({});
  const [profilePhotoUrl, setProfilePhotoUrl] = useState<string | null>(null);
  const [galleryMediasWithUrls, setGalleryMediasWithUrls] = useState<any[]>([]);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioTitle, setAudioTitle] = useState<string | null>(null);
  const [notice, setNotice] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isOpeningPreview, setIsOpeningPreview] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [blockOrder, setBlockOrder] = useState<BlockType[]>([]);
  const [lockedBlocks, setLockedBlocks] = useState<BlockType[]>(['profile', 'text']);
  const [colorPalette, setColorPalette] = useState<string>('navy-gold');
  const [customColors, setCustomColors] = useState({ primary: '#0F2A44', secondary: '#C9A24D', bg: '#F5F4F2' });
  const [photoFilter, setPhotoFilter] = useState<string>('none');

  const editorFontFamily = useMemo(() => {
    if (textTypography === 'sans') return 'var(--font-sans), system-ui, sans-serif';
    if (textTypography === 'calligraphy') return 'var(--font-calli), Georgia, serif';
    return 'var(--font-serif), Georgia, serif';
  }, [textTypography]);

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

      const initialText = sanitizeGeneratedText(
        previewData?.texteGenere ||
          storedText ||
          questionnaire?.resume ||
          questionnaire?.message?.content ||
          ''
      );

      const initialIdentity = formatIdentityForDisplay(previewData || questionnaire || {});
      const mergedQuestionnaire = {
        ...(questionnaire || {}),
        identite: {
          ...(questionnaire?.identite || {}),
          ...initialIdentity,
        },
      };

      setQuestionnaireData(mergedQuestionnaire);
      setMediaData(media || {});
      setCommunType(detectedCommunType);
      setTextTypography(resolveTypographyPreference(previewData?.textTypography));
      setTributeMode(
        previewData?.tributeMode === 'candle' ||
          previewData?.tributeMode === 'flower' ||
          previewData?.tributeMode === 'none'
          ? previewData.tributeMode
          : 'both'
      );
      setCompositionModel(
        resolveCompositionModel(
          previewData?.compositionModel || previewData?.layout,
          detectedCommunType
        )
      );
      setVisualTheme(
        resolveVisualTheme(
          previewData?.visualTheme || previewData?.template,
          detectedCommunType
        )
      );
      setWritingStyle(
        resolveWritingStyle(
          previewData?.writingStyle || previewData?.style || finalization?.style || mergedQuestionnaire?.style,
          detectedCommunType
        )
      );
      setLiensWeb(
        Array.isArray(previewData?.liensWeb)
          ? previewData.liensWeb
          : Array.isArray(mergedQuestionnaire?.liensWeb)
            ? mergedQuestionnaire.liensWeb
            : []
      );
      setFamily(previewData?.family || mergedQuestionnaire?.family || {});

      const resolvedCompositionModel = resolveCompositionModel(
        previewData?.compositionModel || previewData?.layout,
        detectedCommunType
      );
      const finalTemplate = getFinalTemplate(resolvedCompositionModel);
      const preset = getMemorialPreset(detectedCommunType);
      const initialBlockOrder = sanitizeBlockOrder(
        previewData?.blockOrder || finalTemplate.defaultBlockOrder || preset.blockOrder
      );
      setBlockOrder(initialBlockOrder);
      setLockedBlocks(finalTemplate.lockedBlocks);

      const savedFilter = previewData?.photoFilter || media?.photoFilter || 'none';
      setPhotoFilter(savedFilter);

      const savedPaletteId = previewData?.colorPalette;
      if (savedPaletteId) {
        setColorPalette(savedPaletteId);
        const found = COLOR_PALETTES.find(p => p.id === savedPaletteId);
        if (found) setCustomColors({ primary: found.primary, secondary: found.secondary, bg: found.bg });
        else if (previewData?.colors) setCustomColors(previewData.colors);
      }

      if (!initialText.trim()) {
        const fallbackText = buildMemoryFallbackText({
          ...mergedQuestionnaire,
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

  useEffect(() => {
    const loadAssets = async () => {
      setProfilePhotoUrl(null);
      setGalleryMediasWithUrls([]);
      setAudioUrl(null);
      setAudioTitle(null);

      const medias = mediaData || {};
      const profileId = medias?.profilePhotoId || questionnaireData?.identite?.photoProfilId;
      if (profileId) {
        const photo = await getPhoto(profileId);
        if (photo) setProfilePhotoUrl(blobToURL(photo.blob));
      }

      const galleryRaw = Array.isArray(medias?.galleryPhotos)
        ? medias.galleryPhotos
        : Array.isArray(medias?.photos)
          ? medias.photos
          : [];

      if (galleryRaw.length > 0) {
        const mediasWithUrls = await Promise.all(
          galleryRaw.map(async (media: any, index: number) => {
            const rawUrl = String(media?.url || '');
            const idFromUrl = rawUrl.startsWith('indexed-db:') ? rawUrl.replace('indexed-db:', '') : null;
            const lookupId = media?.id || idFromUrl;

            if (lookupId) {
              const photo = await getPhoto(lookupId);
              if (photo) {
                return { ...media, id: media?.id || lookupId, type: 'image', url: blobToURL(photo.blob) };
              }
            }

            if (/^https?:\/\//.test(rawUrl) || rawUrl.startsWith('data:image/')) {
              return { ...media, id: media?.id || `gallery-${index}`, type: 'image', url: rawUrl };
            }

            return null;
          })
        );

        setGalleryMediasWithUrls(mediasWithUrls.filter(Boolean));
      }

      const rawAudio = medias?.audioFile;
      if (typeof rawAudio === 'string' && (rawAudio.startsWith('data:audio/') || rawAudio.startsWith('http'))) {
        setAudioUrl(rawAudio);
        setAudioTitle(medias?.audioTitle || questionnaireData?.gouts?.musique || null);
      } else if (typeof rawAudio === 'string' && rawAudio.startsWith('indexed-db:')) {
        const audioId = rawAudio.replace('indexed-db:', '');
        const audio = await getPhoto(audioId);
        if (audio) {
          setAudioUrl(blobToURL(audio.blob));
          setAudioTitle(medias?.audioTitle || audio.nom || questionnaireData?.gouts?.musique || null);
        }
      }
    };

    void loadAssets();
  }, [mediaData, questionnaireData]);

  const displayName = useMemo(() => {
    const identity = formatIdentityForDisplay(questionnaireData || {});
    return [identity?.prenom, identity?.nom].filter(Boolean).join(' ').trim();
  }, [questionnaireData]);

  const cleanLinks = useMemo(
    () =>
      liensWeb
        .map((link, index) => ({
          id: link.id || `link-${index}`,
          titre: String(link.titre || '').trim(),
          description: String(link.description || '').trim(),
          url: ensureAbsoluteUrl(String(link.url || '').trim()),
        }))
        .filter((link) => link.url),
    [liensWeb]
  );

  const normalizedFamily = useMemo(
    () => ({
      ...family,
      story: String(family?.story || '').trim(),
      pdfUrl: ensureAbsoluteUrl(String(family?.pdfUrl || '').trim()),
      pdfName: String(family?.pdfName || '').trim(),
      members: Array.isArray(family?.members) ? family.members : [],
    }),
    [family]
  );

  const hasFamilyData = useMemo(
    () =>
      Boolean(normalizedFamily.story) ||
      Boolean(normalizedFamily.pdfUrl) ||
      Boolean(normalizedFamily.members.length),
    [normalizedFamily]
  );

  const studioPreviewData = useMemo(() => {
    const questionnaire = questionnaireData || {};
    const finalization = safeParse<any>(getFinalizationRaw());
    const flow = safeParse<any>(localStorage.getItem(STORAGE_KEYS.creationFlow));
    const preset = getMemorialPreset(communType);
    const identity = formatIdentityForDisplay(questionnaire);

    return {
      communType,
      context: finalization?.context || flow?.context || questionnaire?.context || undefined,
      identite: identity,
      occasion: questionnaire?.occasion || undefined,
      talents: questionnaire?.talents || undefined,
      liens: questionnaire?.liens || questionnaire?.liensVie || undefined,
      gouts: questionnaire?.gouts || undefined,
      medias: mediaData || {},
      texteGenere: sanitizeGeneratedText(text),
      template: getLegacyTemplateIdForVisualTheme(visualTheme, communType),
      visualTheme,
      compositionModel,
      writingStyle,
      style: writingStyle,
      layout: getLegacyLayoutIdForCompositionModel(compositionModel),
      blockOrder: blockOrder.length > 0 ? blockOrder : sanitizeBlockOrder(preset.blockOrder),
      lockedBlocks,
      photoFilter,
      colorPalette,
      colors: customColors,
      message: questionnaire?.message?.hasMessage ? questionnaire.message : undefined,
      publishedAt: new Date().toISOString(),
      liensWeb: cleanLinks,
      family: hasFamilyData ? normalizedFamily : undefined,
      tributeMode,
      textTypography,
    };
  }, [
    blockOrder,
    cleanLinks,
    colorPalette,
    communType,
    compositionModel,
    customColors,
    hasFamilyData,
    lockedBlocks,
    mediaData,
    normalizedFamily,
    photoFilter,
    questionnaireData,
    text,
    textTypography,
    tributeMode,
    visualTheme,
    writingStyle,
  ]);

  const previewTemplate = useMemo(() => {
    const base = applyTypographyPreference(
      buildThemeTemplate(visualTheme, communType),
      resolveTypographyPreference(textTypography)
    );
    return {
      ...base,
      colors: {
        ...base.colors,
        bg: customColors.bg,
        text: customColors.primary,
        accent: customColors.secondary,
      },
    };
  }, [communType, customColors, textTypography, visualTheme]);

  const communConfig = getCommunTypeConfig(communType);
  const recommendedCompositionModel = useMemo(
    () => getRecommendedCompositionModel(communType),
    [communType]
  );
  const currentModel = getCompositionModel(compositionModel);
  const currentTheme = getVisualTheme(visualTheme);
  const currentWritingStyle = getWritingStyle(writingStyle);

  const saveState = () => {
    const data = studioPreviewData;
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
      setNotice('Votre atelier a bien été enregistré.');
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
    router.push(`/dashboard/${encodeURIComponent(memoryId)}/generate`);
  };

  const updateIdentityField = (field: 'prenom' | 'nom', value: string) => {
    setQuestionnaireData((prev: any) => ({
      ...(prev || {}),
      identite: {
        ...(prev?.identite || {}),
        [field]: value,
      },
    }));
    if (notice) setNotice('');
  };

  const normalizeIdentityField = (field: 'prenom' | 'nom') => {
    setQuestionnaireData((prev: any) => ({
      ...(prev || {}),
      identite: {
        ...(prev?.identite || {}),
        [field]: formatDisplayNamePart(prev?.identite?.[field]),
      },
    }));
  };

  const addLink = () => {
    setLiensWeb((prev) => [
      ...prev,
      {
        id: `link-${Date.now()}`,
        titre: '',
        url: '',
        description: '',
      },
    ]);
    if (notice) setNotice('');
  };

  const updateLink = (index: number, field: keyof EditableLink, value: string) => {
    setLiensWeb((prev) =>
      prev.map((link, currentIndex) =>
        currentIndex === index
          ? {
              ...link,
              [field]: value,
            }
          : link
      )
    );
    if (notice) setNotice('');
  };

  const removeLink = (index: number) => {
    setLiensWeb((prev) => prev.filter((_, currentIndex) => currentIndex !== index));
    if (notice) setNotice('');
  };

  const isBusy = isSaving || isOpeningPreview || isRegenerating;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F4F2] text-[#0F2A44]">
        Chargement de l’atelier...
      </div>
    );
  }

  if (!memoryId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F4F2] p-6">
        <div className="max-w-xl rounded-3xl border border-[#E7E1D7] bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl italic text-[#0F2A44]">Impossible d’ouvrir cet atelier</h1>
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
    <div className="min-h-screen bg-[linear-gradient(180deg,#F6F2EB_0%,#FBFAF7_28%,#FFFFFF_100%)]">
      <header className="sticky top-0 z-40 border-b border-[#DCCDBA] bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-4 px-6 py-4">
          <div className="min-w-0">
            <Link
              href={`/dashboard/${encodeURIComponent(memoryId)}`}
              className="inline-flex items-center gap-2 text-sm font-medium text-[#0F2A44] hover:text-[#A27C53]"
            >
              <ChevronLeft className="h-4 w-4" />
              Retour au tableau de bord
            </Link>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center rounded-full border border-[#E4D6C5] bg-[#FBF6EF] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#7A5A2E]">
                {communConfig.title}
              </span>
              {displayName ? (
                <span className="text-sm font-medium text-[#0F2A44]">{displayName}</span>
              ) : null}
            </div>
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-3">
            <button
              onClick={handleSave}
              disabled={isBusy}
              className="inline-flex items-center gap-2 rounded-full border border-[#D8D3CA] bg-white px-4 py-2 text-sm text-[#0F2A44] hover:border-[#A27C53]/50 disabled:opacity-60"
            >
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Enregistrer
            </button>
            <button
              onClick={handleRegenerate}
              disabled={isBusy}
              className="inline-flex items-center gap-2 rounded-full border border-[#D8D3CA] bg-white px-4 py-2 text-sm text-[#0F2A44] hover:border-[#A27C53]/50 disabled:opacity-60"
            >
              {isRegenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCcw className="h-4 w-4" />}
              Régénérer le texte
            </button>
            <button
              onClick={handlePreview}
              disabled={isBusy}
              className="inline-flex items-center gap-2 rounded-full bg-[#0F2A44] px-5 py-2 text-sm font-semibold text-white hover:bg-[#1D334B] disabled:opacity-60"
            >
              {isOpeningPreview ? <Loader2 className="h-4 w-4 animate-spin" /> : <Eye className="h-4 w-4" />}
              Aperçu complet
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1500px] px-6 py-8">
        <div className="grid gap-8 xl:grid-cols-[minmax(0,1.02fr)_minmax(380px,0.98fr)]">
          <div className="space-y-8">

            {/* ─── SECTION 1 : Le texte ─────────────────────────────── */}
            <section className="rounded-[32px] border border-[#E7DDCF] bg-white p-6 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-[#FBF4E8] p-2 text-[#A27C53]">
                  <FileText className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-[#0F2A44]">1 — Le texte</h2>
                  <p className="mt-1 text-sm text-[#5E6B78]">
                    Ajuste le nom affiché, puis reprends librement le texte final avant l&apos;aperçu.
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#0F2A44]">Prénom affiché</label>
                  <input
                    type="text"
                    value={questionnaireData?.identite?.prenom || ''}
                    onChange={(event) => updateIdentityField('prenom', event.target.value)}
                    onBlur={() => normalizeIdentityField('prenom')}
                    placeholder="Ex. : Madeleine"
                    className="w-full rounded-2xl border border-[#E5DED2] bg-[#FCFBF8] px-4 py-3 text-base text-[#0F2A44] outline-none transition focus:border-[#C9A24D]/50"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#0F2A44]">Nom affiché</label>
                  <input
                    type="text"
                    value={questionnaireData?.identite?.nom || ''}
                    onChange={(event) => updateIdentityField('nom', event.target.value)}
                    onBlur={() => normalizeIdentityField('nom')}
                    placeholder="Ex. : Roux"
                    className="w-full rounded-2xl border border-[#E5DED2] bg-[#FCFBF8] px-4 py-3 text-base text-[#0F2A44] outline-none transition focus:border-[#C9A24D]/50"
                  />
                </div>
              </div>

              <label className="mt-6 mb-3 block text-sm font-semibold text-[#0F2A44]">
                Texte principal
              </label>
              <textarea
                value={text}
                onChange={(event) => {
                  setText(event.target.value);
                  if (notice) setNotice('');
                }}
                spellCheck
                placeholder="Le texte apparaîtra ici. Vous pourrez le reprendre librement."
                className="min-h-[460px] w-full rounded-[28px] border border-[#E5DED2] bg-[#FCFBF8] p-6 text-lg leading-8 text-[#0F2A44] outline-none transition focus:border-[#C9A24D]/50"
                style={{ fontFamily: editorFontFamily }}
              />

              {!text.trim() ? (
                <div className="mt-4 rounded-2xl border border-[#F0D9C8] bg-[#FFF7F1] px-4 py-3 text-sm text-[#8A4C25]">
                  Le texte est vide pour l&apos;instant. Vous pouvez revenir à la génération ou écrire
                  une première base ici directement.
                </div>
              ) : null}
            </section>

            {/* ─── SECTION 2 : Le rendu ─────────────────────────────── */}
            <section className="rounded-[32px] border border-[#E7DDCF] bg-white px-6 py-6 shadow-[0_30px_80px_rgba(15,42,68,0.06)]">
              <div className="flex items-start gap-3">
                <div className="mt-1 rounded-full bg-[#FBF4E8] p-2 text-[#A27C53]">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-3xl text-[#0F2A44] sm:text-4xl" style={{ fontFamily: 'var(--font-serif)' }}>
                    2 — Le rendu
                  </h2>
                  <p className="mt-2 max-w-3xl text-sm leading-6 text-[#5E6B78] sm:text-base">
                    Choisis le modèle qui donnera son rythme à la page. L&apos;ambiance visuelle et
                    la voix du texte viendront ensuite affiner la composition.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2 text-xs uppercase tracking-[0.18em] text-[#7A5A2E]">
                    <span>Modèle : {currentModel.label}</span>
                    <span>·</span>
                    <span>Ambiance : {currentTheme.label}</span>
                    <span>·</span>
                    <span>Ton : {currentWritingStyle.label}</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 grid gap-4 lg:grid-cols-3">
                {FINAL_TEMPLATES.map((template) => {
                  const isSelected = compositionModel === template.id;
                  const isRecommended = recommendedCompositionModel === template.id;
                  return (
                    <button
                      key={template.id}
                      type="button"
                      onClick={() => {
                        setCompositionModel(template.id);
                        setLockedBlocks(template.lockedBlocks);
                        setBlockOrder(sanitizeBlockOrder(template.defaultBlockOrder));
                        if (notice) setNotice('');
                      }}
                      className={`rounded-[30px] border p-5 text-left transition ${
                        isSelected
                          ? 'border-[#A27C53] bg-[#FFF8EE] shadow-[0_22px_48px_rgba(162,124,83,0.14)]'
                          : 'border-[#EAE2D6] bg-[#FFFEFC] hover:border-[#D9C2A1] hover:shadow-[0_18px_34px_rgba(15,42,68,0.06)]'
                      }`}
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        {isRecommended && (
                          <span className="inline-flex rounded-full bg-[#FBF1DF] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8C6635]">
                            Recommandé
                          </span>
                        )}
                        {isSelected && (
                          <span className="inline-flex rounded-full bg-[#0F2A44] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white">
                            Sélectionné
                          </span>
                        )}
                      </div>
                      <div className="mt-4 overflow-hidden rounded-[20px]">
                        <img
                          src={TEMPLATE_IMAGES[template.id] ?? ''}
                          alt={template.exampleTitle}
                          className="h-32 w-full object-cover"
                        />
                      </div>
                      <p className="mt-4 text-xl font-semibold text-[#0F2A44]">{template.label}</p>
                      <p className="mt-1.5 text-sm leading-6 text-[#5E6B78]">{template.tagline}</p>
                      <Link
                        href={`/exemple/${template.exampleSlug}`}
                        target="_blank"
                        onClick={(e) => e.stopPropagation()}
                        className="mt-3 inline-flex items-center gap-1 text-xs text-[#A27C53] underline-offset-2 hover:underline"
                      >
                        <ExternalLink className="h-3 w-3" />
                        Voir l&apos;exemple : {template.exampleTitle}
                      </Link>
                    </button>
                  );
                })}
              </div>

              <div className="mt-6 rounded-[28px] border border-[#ECE2D4] bg-[#FCF7F0] px-5 py-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="max-w-3xl">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8C6635]">
                      Sélection actuelle
                    </p>
                    <h3
                      className="mt-2 text-2xl text-[#0F2A44] sm:text-3xl"
                      style={{ fontFamily: 'var(--font-serif)' }}
                    >
                      {currentModel.label}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-[#5E6B78] sm:text-base">
                      {currentModel.signature}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs uppercase tracking-[0.18em] text-[#7A5A2E]">
                    <span className="rounded-full border border-[#E2D6C6] bg-white px-3 py-2">
                      {currentTheme.label}
                    </span>
                    <span className="rounded-full border border-[#E2D6C6] bg-white px-3 py-2">
                      {currentWritingStyle.label}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#0F2A44]">
                  <Palette className="h-4 w-4 text-[#A27C53]" />
                  Ambiance visuelle
                </div>
                <div className="grid gap-4 lg:grid-cols-3">
                  {VISUAL_THEMES.map((theme) => {
                    const isSelected = visualTheme === theme.id;
                    return (
                      <button
                        key={theme.id}
                        type="button"
                        onClick={() => {
                          setVisualTheme(theme.id);
                          if (notice) setNotice('');
                        }}
                        className={`rounded-[26px] border p-4 text-left transition ${
                          isSelected
                            ? 'border-[#A27C53] bg-[#FFF8EE] shadow-[0_18px_40px_rgba(162,124,83,0.12)]'
                            : 'border-[#EAE2D6] bg-[#FFFEFC] hover:border-[#D9C2A1]'
                        }`}
                      >
                        <div
                          className="mb-4 h-20 rounded-[18px]"
                          style={{
                            background: `linear-gradient(135deg, ${theme.preview.from}, ${theme.preview.via}, ${theme.preview.to})`,
                          }}
                        />
                        <p className="text-base font-semibold text-[#0F2A44]">{theme.label}</p>
                        <p className="mt-1 text-xs uppercase tracking-[0.18em] text-[#7A5A2E]">
                          {theme.badge}
                        </p>
                        <p className="mt-3 text-sm leading-6 text-[#5E6B78]">{theme.description}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-8">
                <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#0F2A44]">
                  <Sparkles className="h-4 w-4 text-[#A27C53]" />
                  Ton du texte
                </div>
                <div className="grid gap-3 lg:grid-cols-2">
                  {WRITING_STYLES.map((style) => {
                    const isSelected = writingStyle === style.id;
                    return (
                      <button
                        key={style.id}
                        type="button"
                        onClick={() => {
                          setWritingStyle(style.id);
                          if (notice) setNotice('');
                        }}
                        className={`rounded-[24px] border px-4 py-4 text-left transition ${
                          isSelected
                            ? 'border-[#A27C53] bg-[#FFF8EE]'
                            : 'border-[#EAE2D6] bg-[#FFFEFC] hover:border-[#D9C2A1]'
                        }`}
                      >
                        <p className="text-sm font-semibold text-[#0F2A44]">{style.label}</p>
                        <p className="mt-1 text-sm leading-6 text-[#5E6B78]">{style.description}</p>
                        <p className="mt-3 text-xs italic leading-5 text-[#7B7B74]">{style.example}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {notice ? (
                <div className="mt-5 rounded-2xl border border-[#D7EAD8] bg-[#F4FBF4] px-4 py-3 text-sm text-[#2F5B35]">
                  {notice}
                </div>
              ) : null}
            </section>

            {/* ─── SECTION 3 : L'apparence ─────────────────────────── */}
            <section className="rounded-[32px] border border-[#E7DDCF] bg-white p-6 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-[#FBF4E8] p-2 text-[#A27C53]">
                  <Palette className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-[#0F2A44]">3 — L&apos;apparence</h2>
                  <p className="mt-1 text-sm text-[#5E6B78]">
                    Typographie de lecture, palette de couleurs et filtre photo.
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#0F2A44]">
                  <Type className="h-4 w-4 text-[#A27C53]" />
                  Typographie de lecture
                </div>
                <div className="grid gap-3 md:grid-cols-3">
                  {TYPOGRAPHY_OPTIONS.map((option) => {
                    const isSelected = textTypography === option.id;
                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => {
                          setTextTypography(option.id);
                          if (notice) setNotice('');
                        }}
                        className={`rounded-[22px] border px-4 py-4 text-left transition ${
                          isSelected
                            ? 'border-[#A27C53] bg-[#FFF8EE]'
                            : 'border-[#EAE2D6] bg-[#FFFEFC] hover:border-[#D9C2A1]'
                        }`}
                      >
                        <p className="text-sm font-semibold text-[#0F2A44]">{option.label}</p>
                        <p className="mt-1 text-xs leading-5 text-[#5E6B78]">{option.description}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-8">
                <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#0F2A44]">
                  <Palette className="h-4 w-4 text-[#A27C53]" />
                  Palette de couleurs
                </div>
                <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
                  {COLOR_PALETTES.map((palette) => {
                    const isSelected = colorPalette === palette.id;
                    return (
                      <button
                        key={palette.id}
                        type="button"
                        onClick={() => {
                          setColorPalette(palette.id);
                          setCustomColors({ primary: palette.primary, secondary: palette.secondary, bg: palette.bg });
                          if (notice) setNotice('');
                        }}
                        className={`rounded-[18px] border p-3 text-center transition ${
                          isSelected
                            ? 'border-[#A27C53] bg-[#FFF8EE] shadow-sm'
                            : 'border-[#EAE2D6] bg-[#FFFEFC] hover:border-[#D9C2A1]'
                        }`}
                      >
                        <div
                          className="mx-auto mb-2 h-8 w-8 rounded-full border border-black/10"
                          style={{ background: `linear-gradient(135deg, ${palette.primary} 50%, ${palette.secondary} 50%)` }}
                        />
                        <p className="text-xs font-medium text-[#0F2A44]">{palette.name}</p>
                      </button>
                    );
                  })}
                </div>
                <div className="mt-4 grid grid-cols-3 gap-3">
                  {(['primary', 'secondary', 'bg'] as const).map((key) => {
                    const labels = { primary: 'Couleur principale', secondary: 'Couleur accent', bg: 'Fond' };
                    return (
                      <label key={key} className="flex flex-col gap-1.5">
                        <span className="text-xs text-[#5E6B78]">{labels[key]}</span>
                        <div className="flex items-center gap-2 rounded-xl border border-[#E5DED2] bg-white px-3 py-2">
                          <input
                            type="color"
                            value={customColors[key]}
                            onChange={(e) => {
                              setColorPalette('custom');
                              setCustomColors((prev) => ({ ...prev, [key]: e.target.value }));
                            }}
                            className="h-5 w-5 cursor-pointer rounded border-0 bg-transparent p-0"
                          />
                          <span className="font-mono text-xs text-[#5E6B78]">{customColors[key]}</span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="mt-8">
                <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#0F2A44]">
                  <ImageIcon className="h-4 w-4 text-[#A27C53]" />
                  Filtre photo
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {PHOTO_FILTER_OPTIONS.map((filter) => {
                    const isSelected = photoFilter === filter.id;
                    return (
                      <button
                        key={filter.id}
                        type="button"
                        onClick={() => {
                          setPhotoFilter(filter.id);
                          if (notice) setNotice('');
                        }}
                        className={`rounded-[18px] border p-3 text-center transition ${
                          isSelected
                            ? 'border-[#A27C53] bg-[#FFF8EE]'
                            : 'border-[#EAE2D6] bg-[#FFFEFC] hover:border-[#D9C2A1]'
                        }`}
                      >
                        <div
                          className="mx-auto mb-2 h-10 w-10 rounded-xl bg-[#D9C4A8]"
                          style={{ filter: filter.css }}
                        />
                        <p className="text-xs font-medium text-[#0F2A44]">{filter.label}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* ─── SECTION 4 : Les détails ─────────────────────────── */}
            <section className="rounded-[32px] border border-[#E7DDCF] bg-white p-6 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-[#FBF4E8] p-2 text-[#A27C53]">
                  <Heart className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-[#0F2A44]">4 — Les détails</h2>
                  <p className="mt-1 text-sm text-[#5E6B78]">
                    Hommage visuel, organisation des blocs, musique, liens et arbre généalogique.
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#0F2A44]">
                  <Heart className="h-4 w-4 text-[#A27C53]" />
                  Hommage visuel
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  {TRIBUTE_OPTIONS.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => {
                        setTributeMode(option.id);
                        if (notice) setNotice('');
                      }}
                      className={`rounded-[22px] border px-4 py-4 text-left transition ${
                        tributeMode === option.id
                          ? 'border-[#A27C53] bg-[#FFF8EE]'
                          : 'border-[#EAE2D6] bg-[#FFFEFC] hover:border-[#D9C2A1]'
                      }`}
                    >
                      <p className="text-sm font-semibold text-[#0F2A44]">{option.label}</p>
                      <p className="mt-1 text-xs leading-5 text-[#5E6B78]">{option.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              {blockOrder.length > 0 && (
                <div className="mt-8">
                  <div className="mb-1 flex items-center gap-2 text-sm font-semibold text-[#0F2A44]">
                    Organisation des blocs
                  </div>
                  <p className="mb-4 text-sm text-[#5E6B78]">
                    Glissez-déposez ou utilisez les flèches pour changer l&apos;ordre des sections.
                    Les blocs <span className="font-medium text-[#9E9585]">fixe</span> font partie de la structure du template et ne peuvent pas être déplacés.
                  </p>
                  <SortableBlockEditor
                    blocks={blockOrder}
                    lockedBlocks={lockedBlocks}
                    onOrderChange={(newBlocks) => {
                      setBlockOrder(newBlocks);
                      if (notice) setNotice('');
                    }}
                  />
                </div>
              )}

              <div className="mt-8 rounded-[28px] border border-[#EAE2D6] bg-[#FCFBF8] p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#0F2A44]">
                      <Music className="h-4 w-4 text-[#A27C53]" />
                      Musique dans le rendu
                    </div>
                    <p className="text-sm text-[#5E6B78]">
                      Si une musique est choisie, elle apparaît dans la preview et dans la page
                      finale, sans lecture automatique agressive.
                    </p>
                  </div>
                  <Link
                    href="/medias"
                    className="inline-flex rounded-full border border-[#D8D3CA] px-4 py-2 text-sm text-[#0F2A44] hover:border-[#A27C53]/50"
                  >
                    Modifier les médias
                  </Link>
                </div>
                {audioUrl ? (
                  <div className="mt-4 space-y-3">
                    <div className="rounded-2xl border border-[#E4D7C8] bg-white px-4 py-3">
                      <p className="text-sm font-semibold text-[#0F2A44]">
                        {audioTitle || 'Musique sélectionnée'}
                      </p>
                      <p className="mt-1 text-xs text-[#6E6A63]">
                        Lecteur visible dans l&apos;aperçu et la page finale.
                      </p>
                    </div>
                    <audio controls className="w-full">
                      <source src={audioUrl} />
                    </audio>
                  </div>
                ) : (
                  <div className="mt-4 rounded-2xl border border-dashed border-[#D8D3CA] px-4 py-4 text-sm text-[#6E6A63]">
                    Aucune musique pour le moment.
                  </div>
                )}
              </div>

              <div className="mt-8">
                <div className="mb-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-[#0F2A44]">
                    <Link2 className="h-4 w-4 text-[#A27C53]" />
                    Liens utiles
                  </div>
                  <button
                    onClick={addLink}
                    type="button"
                    className="inline-flex items-center gap-2 rounded-full border border-[#D8D3CA] px-3 py-2 text-sm text-[#0F2A44] hover:border-[#A27C53]/50"
                  >
                    <Plus className="h-4 w-4" />
                    Ajouter un lien
                  </button>
                </div>
                <p className="mb-4 text-sm text-[#5E6B78]">
                  Ajoutez ici une cagnotte, un lien de fleurs, ou tout autre lien externe utile.
                </p>
                {liensWeb.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-[#D8D3CA] px-4 py-4 text-sm text-[#6E6A63]">
                    Aucun lien pour le moment.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {liensWeb.map((link, index) => (
                      <div key={link.id || `link-${index}`} className="rounded-2xl border border-[#ECE7DE] bg-[#FCFBF8] p-4">
                        <div className="mb-3 flex items-center justify-between gap-3">
                          <span className="text-sm font-semibold text-[#0F2A44]">Lien {index + 1}</span>
                          <button
                            type="button"
                            onClick={() => removeLink(index)}
                            className="inline-flex items-center gap-1 text-sm text-[#8A4C25] hover:text-[#6B3418]"
                          >
                            <Trash2 className="h-4 w-4" />
                            Retirer
                          </button>
                        </div>
                        <div className="grid gap-3 md:grid-cols-2">
                          <input
                            type="text"
                            value={link.titre || ''}
                            onChange={(event) => updateLink(index, 'titre', event.target.value)}
                            placeholder="Titre du lien"
                            className="rounded-xl border border-[#E5DED2] bg-white px-4 py-3 text-sm text-[#0F2A44] outline-none transition focus:border-[#C9A24D]/50"
                          />
                          <input
                            type="url"
                            value={link.url || ''}
                            onChange={(event) => updateLink(index, 'url', event.target.value)}
                            placeholder="https://..."
                            className="rounded-xl border border-[#E5DED2] bg-white px-4 py-3 text-sm text-[#0F2A44] outline-none transition focus:border-[#C9A24D]/50"
                          />
                        </div>
                        <textarea
                          value={link.description || ''}
                          onChange={(event) => updateLink(index, 'description', event.target.value)}
                          placeholder="Description courte (facultatif)"
                          className="mt-3 min-h-[92px] w-full rounded-xl border border-[#E5DED2] bg-white px-4 py-3 text-sm text-[#0F2A44] outline-none transition focus:border-[#C9A24D]/50"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-8 rounded-[28px] border border-[#EAE2D6] bg-[#FCFBF8] p-5">
                <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#0F2A44]">
                  <FileText className="h-4 w-4 text-[#A27C53]" />
                  Arbre généalogique
                </div>
                <p className="mb-4 text-sm text-[#5E6B78]">
                  Si vous avez déjà préparé un arbre, ajoutez ici son lien ou son PDF.
                </p>
                <div className="grid gap-3 md:grid-cols-2">
                  <input
                    type="url"
                    value={family?.pdfUrl || ''}
                    onChange={(event) => {
                      setFamily((prev) => ({ ...(prev || {}), pdfUrl: event.target.value }));
                      if (notice) setNotice('');
                    }}
                    placeholder="Lien du PDF ou de la page"
                    className="rounded-xl border border-[#E5DED2] bg-white px-4 py-3 text-sm text-[#0F2A44] outline-none transition focus:border-[#C9A24D]/50"
                  />
                  <input
                    type="text"
                    value={family?.pdfName || ''}
                    onChange={(event) => {
                      setFamily((prev) => ({ ...(prev || {}), pdfName: event.target.value }));
                      if (notice) setNotice('');
                    }}
                    placeholder="Nom affiché du document"
                    className="rounded-xl border border-[#E5DED2] bg-white px-4 py-3 text-sm text-[#0F2A44] outline-none transition focus:border-[#C9A24D]/50"
                  />
                </div>
              </div>
            </section>

          </div>

          <aside className="xl:sticky xl:top-24 xl:self-start">
            <div className="overflow-hidden rounded-[32px] border border-[#D7CCBC] bg-white shadow-[0_30px_80px_rgba(15,42,68,0.08)]">
              <div className="flex items-center justify-between border-b border-[#ECE4D8] px-5 py-4">
                <div>
                  <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-[#7A5A2E]">
                    Aperçu fidèle
                  </h2>
                  <p className="mt-1 text-xs text-[#6E6A63]">
                    Même structure, même ambiance, mêmes blocs que la page finale.
                  </p>
                </div>
                <button
                  onClick={handlePreview}
                  disabled={isBusy}
                  className="inline-flex items-center gap-2 rounded-full border border-[#D8D3CA] px-3 py-2 text-xs font-medium text-[#0F2A44] disabled:opacity-60"
                >
                  <Eye className="h-3.5 w-3.5" />
                  Grand aperçu
                </button>
              </div>
              <div className="max-h-[calc(100vh-180px)] overflow-auto bg-[#F7F2EA]">
                <PublishedMemorialRenderer
                  memorial={studioPreviewData}
                  communType={communType}
                  memorialId={memoryId}
                  currentTemplate={previewTemplate}
                  compositionModel={compositionModel}
                  visualTheme={visualTheme}
                  writingStyle={writingStyle}
                  profilePhotoUrl={profilePhotoUrl}
                  galleryMediasWithUrls={galleryMediasWithUrls}
                  audioUrl={audioUrl}
                  audioTitle={audioTitle}
                  embedded
                />
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
                                                                                                                                                                              