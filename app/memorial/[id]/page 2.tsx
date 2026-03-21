'use client';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Home, Share2 } from 'lucide-react';
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
import ReportButton from '@/components/ReportButton';
import { resolveCommunTypeFromContext } from '@/lib/communTypes';
import { resolveCommunTypeFromPayload } from '@/lib/almaProfiles';
import { getDefaultTemplateIdForCommunType, getMemorialPreset, sanitizeBlockOrder } from '@/lib/memorialPresets';
import {
  applyTypographyPreference,
  buildThematicSections,
  ensureAbsoluteUrl,
  resolveIdentity,
  resolveTypographyPreference,
  sanitizeGeneratedText,
} from '@/lib/memorialRuntime';

export default function MemorialPage() {
  const params = useParams();
  const router = useRouter();
  const [memorial, setMemorial] = useState<any>(null);
  const [profilePhotoUrl, setProfilePhotoUrl] = useState<string | null>(null);
  const [galleryMediasWithUrls, setGalleryMediasWithUrls] = useState<any[]>([]);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioTitle, setAudioTitle] = useState<string | null>(null);

  useEffect(() => {
    const id = params?.id;
    if (!id) {
      router.push('/');
      return;
    }
    const decodedId = decodeURIComponent(String(id));

    const fetchMemorial = async () => {
      try {
        const { data: row, error } = await supabase
          .from('memoriaux')
          .select('*')
          .eq('slug', decodedId)
          .maybeSingle();

        if (error) {
          console.error('Erreur Supabase:', error);
          return;
        }

        if (!row) {
          console.warn('Mémorial non trouvé pour le slug:', id);
          router.push('/');
          return;
        }

        const payload = row.data ?? row;
        const normalized = {
          ...payload,
          identite: resolveIdentity(payload),
          texteGenere: sanitizeGeneratedText(payload?.texteGenere),
          liensWeb: (Array.isArray(payload?.liensWeb) ? payload.liensWeb : [])
            .map((l: any, i: number) => ({ ...l, id: l?.id || `l-${i}`, url: ensureAbsoluteUrl(l?.url || '') }))
            .filter((l: any) => l.url),
        };
        setMemorial(normalized);

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
            : Array.isArray(payload?.medias)
              ? payload.medias
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
        } else if (normalized?.gouts?.musiqueFileId) {
          const audio = await getPhoto(normalized.gouts.musiqueFileId);
          if (audio) {
            setAudioUrl(blobToURL(audio.blob));
            setAudioTitle(audio.nom || normalized?.gouts?.musique || null);
          }
        }
      } catch (e) {
        console.error('Erreur fetchMemorial:', e);
        router.push('/');
      }
    };

    fetchMemorial();
  }, [params, router]);

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: 'Mémorial de ' + (memorial?.identite?.prenom || ''),
        url,
      });
    } else {
      navigator.clipboard.writeText(url);
      alert('Lien copié !');
    }
  };

  if (!memorial) {
    return (
      <div className="min-h-screen bg-memoir-bg flex items-center justify-center">
        <p className="text-memoir-blue">Chargement...</p>
      </div>
    );
  }

  if (memorial?.access_status === 'suspended') {
    return (
      <main className="min-h-screen bg-[#F7F7F5] px-6 py-24">
        <div className="mx-auto max-w-2xl rounded-2xl border border-[#E5E7EB] bg-white p-8 text-center">
          <h1 className="text-2xl font-semibold text-[#1F2B35]">Espace temporairement indisponible</h1>
          <p className="mt-3 text-sm text-[#5E6B78]">
            Ce memorial n'est pas accessible pour le moment. Merci de contacter l'agence ou la famille reference.
          </p>
        </div>
      </main>
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

  const baseTemplate = getTemplate(template || getDefaultTemplateIdForCommunType(communType));
  const currentTemplate = applyTypographyPreference(baseTemplate, resolveTypographyPreference(textTypography));
  const isLightBg = ['sepia-terre', 'encre-manuscrit'].includes(template || '');
  const memorialId = params?.id as string;
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
        gouts={gouts}
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
      <section className="relative py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-12">
            <Link
              href="/"
              className="inline-flex items-center gap-2 transition-colors"
              style={{ color: currentTemplate.colors.accent }}
            >
              <Home className="w-5 h-5" />
              <span className="text-sm">Retour</span>
            </Link>

            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-sm"
              style={{
                backgroundColor: currentTemplate.colors.accent,
                color: isLightBg ? '#fff' : currentTemplate.colors.bg
              }}
            >
              <Share2 className="w-4 h-4" />
              Partager
            </button>
          </div>

          <MemorialLayout
            layout={finalLayout}
            blockOrder={finalBlockOrder}
            blocks={blocks}
          />
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 pb-8 flex justify-end">
        <ReportButton />
      </div>

      <Footer />
    </main>
  );
}
