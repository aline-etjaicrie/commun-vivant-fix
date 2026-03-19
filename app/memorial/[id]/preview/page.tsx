'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Edit2 } from 'lucide-react';
import Footer from '@/components/Footer';
import PublishedMemorialRenderer from '@/components/memorial/PublishedMemorialRenderer';
import { blobToURL, getPhoto } from '@/lib/indexedDB';
import { resolveCommunTypeFromContext } from '@/lib/communTypes';
import { resolveCommunTypeFromPayload } from '@/lib/almaProfiles';
import {
  STORAGE_KEYS,
  getFinalizationRaw,
  getQuestionnaireDataRaw,
} from '@/lib/creationFlowStorage';
import {
  buildThemeTemplate,
  resolveCompositionModel,
  resolveVisualTheme,
  resolveWritingStyle,
} from '@/lib/compositionStudio';
import {
  applyTypographyPreference,
  ensureAbsoluteUrl,
  formatIdentityForDisplay,
  resolveTypographyPreference,
  safeParse,
  sanitizeGeneratedText,
} from '@/lib/memorialRuntime';
import { getValidateUrl } from '@/lib/validateUrl';
import { buildMemoryFallbackText } from '@/lib/memoryFallbackText';

export default function MemorialPreviewPage() {
  const params = useParams();
  const router = useRouter();
  const [memorial, setMemorial] = useState<any>(null);
  const [profilePhotoUrl, setProfilePhotoUrl] = useState<string | null>(null);
  const [galleryMediasWithUrls, setGalleryMediasWithUrls] = useState<any[]>([]);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioTitle, setAudioTitle] = useState<string | null>(null);

  useEffect(() => {
    const loadAssets = async (normalized: any) => {
      setProfilePhotoUrl(null);
      setGalleryMediasWithUrls([]);
      setAudioUrl(null);
      setAudioTitle(null);

      const medias = normalized?.medias || {};
      const profileId = medias?.profilePhotoId || normalized?.identite?.photoProfilId;
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
              if (photo) return { ...media, id: media?.id || lookupId, type: 'image', url: blobToURL(photo.blob) };
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
        setAudioTitle(medias?.audioTitle || normalized?.gouts?.musique || null);
      } else if (typeof rawAudio === 'string' && rawAudio.startsWith('indexed-db:')) {
        const audioId = rawAudio.replace('indexed-db:', '');
        const audio = await getPhoto(audioId);
        if (audio) {
          setAudioUrl(blobToURL(audio.blob));
          setAudioTitle(medias?.audioTitle || audio.nom || normalized?.gouts?.musique || null);
        }
      }
    };

    const previewData = safeParse<any>(localStorage.getItem('memorialPreviewData'));
    const questionnaireData = safeParse<any>(getQuestionnaireDataRaw());
    const mediaData = safeParse<any>(localStorage.getItem(STORAGE_KEYS.mediaData)) || {};
    const finalization = safeParse<any>(getFinalizationRaw());
    const flow = safeParse<any>(localStorage.getItem(STORAGE_KEYS.creationFlow));
    const generatedText = sanitizeGeneratedText(
      localStorage.getItem(STORAGE_KEYS.generatedMemorialText) ||
      questionnaireData?.resume ||
      questionnaireData?.message?.content ||
      ''
    );

    const fallbackCommunType = finalization?.communType
      ? resolveCommunTypeFromPayload(finalization.communType)
      : resolveCommunTypeFromContext(finalization?.context || flow?.context || questionnaireData?.context);

    const baseSource = previewData || {
      communType: fallbackCommunType,
      context: finalization?.context || flow?.context || questionnaireData?.context,
      identite: formatIdentityForDisplay(questionnaireData),
      occasion: questionnaireData?.occasion || undefined,
      talents: questionnaireData?.talents || undefined,
      liens: questionnaireData?.liens || questionnaireData?.liensVie || undefined,
      gouts: questionnaireData?.gouts || undefined,
      medias: mediaData,
      texteGenere: generatedText,
    };

    const communType = baseSource?.communType
      ? resolveCommunTypeFromPayload(baseSource.communType)
      : fallbackCommunType;

    const safeText =
      sanitizeGeneratedText(baseSource?.texteGenere || '') ||
      buildMemoryFallbackText({
        ...questionnaireData,
        medias: mediaData,
        communType,
        context: baseSource?.context,
      });

    const normalized = {
      ...baseSource,
      communType,
      identite: formatIdentityForDisplay(baseSource),
      talents: baseSource?.talents || questionnaireData?.talents || undefined,
      liens: baseSource?.liens || baseSource?.liensVie || questionnaireData?.liens || questionnaireData?.liensVie || undefined,
      gouts: baseSource?.gouts || questionnaireData?.gouts || {},
      texteGenere: safeText,
      visualTheme: resolveVisualTheme(baseSource?.visualTheme || baseSource?.template, communType),
      compositionModel: resolveCompositionModel(baseSource?.compositionModel || baseSource?.layout, communType),
      writingStyle: resolveWritingStyle(baseSource?.writingStyle || baseSource?.style, communType),
      liensWeb: (Array.isArray(baseSource?.liensWeb) ? baseSource.liensWeb : [])
        .map((l: any, i: number) => ({ ...l, id: l?.id || `l-${i}`, url: ensureAbsoluteUrl(l?.url || '') }))
        .filter((l: any) => l.url),
    };

    setMemorial(normalized);
    void loadAssets(normalized);
  }, [params, router]);

  const previewTemplate = useMemo(() => {
    if (!memorial) return null;
    return applyTypographyPreference(
      buildThemeTemplate(memorial.visualTheme, memorial.communType),
      resolveTypographyPreference(memorial.textTypography)
    );
  }, [memorial]);

  const handleShare = () => {
    alert("Ceci est un aperçu. Publiez le mémorial pour le partager.");
  };

  if (!memorial || !previewTemplate) {
    return (
      <div className="min-h-screen bg-[#F7F2EA] flex items-center justify-center">
        <p className="text-[#5E6B78]">Chargement de l’aperçu...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen" style={{ backgroundColor: previewTemplate.colors.bg }}>
      <div className="bg-[#0F2A44] text-white py-3 px-4 text-center shadow-md flex justify-between items-center">
        <div className="font-medium text-sm">Mode Aperçu</div>
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm bg-white/10 px-3 py-1 rounded hover:bg-white/20 transition-colors"
        >
          <Edit2 className="w-4 h-4" />
          Modifier
        </button>
      </div>

      <PublishedMemorialRenderer
        memorial={memorial}
        communType={memorial.communType}
        memorialId={(params?.id as string) || 'preview'}
        currentTemplate={previewTemplate}
        compositionModel={memorial.compositionModel}
        visualTheme={memorial.visualTheme}
        writingStyle={memorial.writingStyle}
        profilePhotoUrl={profilePhotoUrl}
        galleryMediasWithUrls={galleryMediasWithUrls}
        audioUrl={audioUrl}
        audioTitle={audioTitle || memorial?.gouts?.musique}
        showActions
        showCompositionBadges
        backHref={getValidateUrl(String(params?.id || ''))}
        backLabel="Retour à l’atelier"
        onShare={handleShare}
        shareDisabled
      />

      <Footer />
    </main>
  );
}
