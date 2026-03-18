'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Home, Share2, Edit2 } from 'lucide-react';
import Footer from '@/components/Footer';
import MemorialLayout from '@/components/MemorialLayout';
import {
  ProfileBlock,
  TextBlock,
  MessagesBlock,
  GalleryBlock,
  GoutsBlock,
  TributeBlock,
  LinksBlock,
  FamilyBlock,
  LocationBlock,
  ContributeBlock,
} from '@/components/memorial-blocks';
import { getPhoto, blobToURL } from '@/lib/indexedDB';
import { getTemplate } from '@/lib/templates';
import { BlockType } from '@/lib/layouts';
import { resolveCommunTypeFromContext } from '@/lib/communTypes';
import { resolveCommunTypeFromPayload } from '@/lib/almaProfiles';
import { getDefaultTemplateIdForCommunType, getMemorialPreset, sanitizeBlockOrder } from '@/lib/memorialPresets';
import {
  STORAGE_KEYS,
  getFinalizationRaw,
  getQuestionnaireDataRaw,
} from '@/lib/creationFlowStorage';
import {
  applyTypographyPreference,
  buildThematicSections,
  ensureAbsoluteUrl,
  resolveIdentity,
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

    const fallbackPreset = getMemorialPreset(fallbackCommunType);
    const fallbackTemplate = getDefaultTemplateIdForCommunType(fallbackCommunType);

    const baseSource = previewData || {
      communType: fallbackCommunType,
      context: finalization?.context || flow?.context || questionnaireData?.context,
      identite: resolveIdentity(questionnaireData),
      occasion: questionnaireData?.occasion || undefined,
      talents: questionnaireData?.talents || undefined,
      liens: questionnaireData?.liens || questionnaireData?.liensVie || undefined,
      gouts: questionnaireData?.gouts || undefined,
      medias: mediaData,
      texteGenere: generatedText,
      template: fallbackTemplate,
      layout: fallbackPreset.layout,
      blockOrder: fallbackPreset.blockOrder,
    };

    const safeText =
      sanitizeGeneratedText(baseSource?.texteGenere || '') ||
      buildMemoryFallbackText({
        ...questionnaireData,
        medias: mediaData,
        communType: fallbackCommunType,
        context: baseSource?.context,
      });

    const normalized = {
      ...baseSource,
      communType: baseSource?.communType || fallbackCommunType,
      context: baseSource?.context || finalization?.context || flow?.context || questionnaireData?.context,
      identite: resolveIdentity(baseSource),
      talents: baseSource?.talents || questionnaireData?.talents || undefined,
      liens: baseSource?.liens || baseSource?.liensVie || questionnaireData?.liens || questionnaireData?.liensVie || undefined,
      gouts: baseSource?.gouts || questionnaireData?.gouts || {},
      texteGenere: safeText,
      template: baseSource?.template || fallbackTemplate,
      layout: baseSource?.layout || fallbackPreset.layout,
      blockOrder: sanitizeBlockOrder(baseSource?.blockOrder || fallbackPreset.blockOrder),
      liensWeb: (Array.isArray(baseSource?.liensWeb) ? baseSource.liensWeb : [])
        .map((l: any, i: number) => ({ ...l, id: l?.id || `l-${i}`, url: ensureAbsoluteUrl(l?.url || '') }))
        .filter((l: any) => l.url),
    };

    setMemorial(normalized);
    void loadAssets(normalized);
  }, [params, router]);

  const handleShare = () => {
    alert("Ceci est un aperçu. Publiez le mémorial pour le partager.");
  };

  if (!memorial) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Chargement de l'aperçu...</p>
      </div>
    );
  }

  const communType = memorial?.communType
    ? resolveCommunTypeFromPayload(memorial.communType)
    : resolveCommunTypeFromContext(memorial?.context);
  const preset = getMemorialPreset(communType);

  const {
    identite,
    gouts,
    texteGenere,
    template,
    customColors,
    photoFilter,
    message,
    layout,
    blockOrder,
    liensWeb,
    family,
    location,
    citation,
    textTypography,
    profilePhotoShape,
    tributeMode,
  } = memorial;

  const baseTemplate = getTemplate(template || getDefaultTemplateIdForCommunType(communType), customColors);
  const currentTemplate = applyTypographyPreference(baseTemplate, resolveTypographyPreference(textTypography));
  const isLightBg = ['sepia-terre', 'encre-manuscrit'].includes(template || '');
  const memorialId = (params?.id as string) || 'preview';
  const finalLayout = layout || preset.layout;
  const finalBlockOrder: BlockType[] = sanitizeBlockOrder(blockOrder || preset.blockOrder);
  const quoteText = citation || gouts?.citation || gouts?.phrase || '';
  const thematicSections = buildThematicSections(memorial);

  const blocks = {
    profile: (
      <ProfileBlock
        prenom={identite?.prenom}
        nom={identite?.nom}
        dateNaissance={identite?.dateNaissance}
        dateDeces={identite?.dateDeces}
        photoUrl={profilePhotoUrl || undefined}
        template={currentTemplate}
        photoFilter={photoFilter}
        photoShape={profilePhotoShape === 'square' ? 'square' : 'round'}
      />
    ),
    text: (
      <TextBlock
        texte={sanitizeGeneratedText(texteGenere)}
        template={currentTemplate}
        isLightBg={isLightBg}
        fontStyle={resolveTypographyPreference(textTypography)}
        thematicSections={thematicSections}
      />
    ),
    messages: (
      <MessagesBlock
        message={message}
        template={currentTemplate}
      />
    ),
    gallery: (
      <GalleryBlock
        medias={galleryMediasWithUrls}
        photoFilter={photoFilter}
        template={currentTemplate}
        isLightBg={isLightBg}
        presentationMode={memorial?.medias?.presentationMode || memorial?.presentationMode}
      />
    ),
    gouts: (
      <GoutsBlock
        gouts={gouts || {}}
        audioUrl={audioUrl}
        audioTitle={audioTitle || gouts?.musique}
        template={currentTemplate}
        isLightBg={isLightBg}
      />
    ),
    candle: (
      <TributeBlock
        prenom={identite?.prenom || ''}
        memorialId={memorialId}
        template={currentTemplate}
        funeraireMode={tributeMode === 'candle' || tributeMode === 'flower' ? tributeMode : 'both'}
      />
    ),
    links: (
      <LinksBlock
        liens={liensWeb || []}
        template={currentTemplate}
      />
    ),
    family: (
      <FamilyBlock
        template={currentTemplate}
        isLightBg={isLightBg}
        story={family?.story || ''}
        members={Array.isArray(family?.members) ? family.members : []}
        pdfUrl={family?.pdfUrl || ''}
        pdfName={family?.pdfName || ''}
      />
    ),
    location: (
      <LocationBlock
        template={currentTemplate}
        isLightBg={isLightBg}
        location={location || null}
      />
    ),
    contribute: (
      <ContributeBlock
        template={currentTemplate}
        isLightBg={isLightBg}
        links={liensWeb || []}
      />
    ),
    quote: quoteText ? (
      <div className="rounded-xl shadow p-6 italic text-lg" style={{ color: currentTemplate.colors.text, backgroundColor: isLightBg ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.05)' }}>
        “{quoteText}”
      </div>
    ) : null,
  };

  return (
    <main className="min-h-screen" style={{ backgroundColor: currentTemplate.colors.bg }}>
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

      <section className="relative py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-12">
            <Link
              href={getValidateUrl(String(params?.id || ''))}
              className="inline-flex items-center gap-2 transition-colors"
              style={{ color: currentTemplate.colors.accent }}
            >
              <Home className="w-5 h-5" />
              <span className="text-sm">Retour</span>
            </Link>

            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-sm opacity-50 cursor-not-allowed"
              style={{
                backgroundColor: currentTemplate.colors.accent,
                color: isLightBg ? '#fff' : currentTemplate.colors.bg
              }}
            >
              <Share2 className="w-4 h-4" />
              Partager (Désactivé)
            </button>
          </div>

          <MemorialLayout
            layout={finalLayout}
            blockOrder={finalBlockOrder}
            blocks={blocks}
          />
        </div>
      </section>

      <Footer />
    </main>
  );
}
