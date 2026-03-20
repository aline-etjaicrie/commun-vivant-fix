'use client';

import { supabase } from '@/lib/supabase';
import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Footer from '@/components/Footer';
import ReportButton from '@/components/ReportButton';
import PublishedMemorialRenderer from '@/components/memorial/PublishedMemorialRenderer';
import { blobToURL, getPhoto } from '@/lib/indexedDB';
import { resolveCommunTypeFromContext } from '@/lib/communTypes';
import { resolveCommunTypeFromPayload } from '@/lib/almaProfiles';
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
        const communType = payload?.communType
          ? resolveCommunTypeFromPayload(payload.communType)
          : resolveCommunTypeFromContext(payload?.context);

        const normalized = {
          ...payload,
          communType,
          identite: formatIdentityForDisplay(payload),
          texteGenere: sanitizeGeneratedText(payload?.texteGenere),
          visualTheme: resolveVisualTheme(payload?.visualTheme || payload?.template, communType),
          compositionModel: resolveCompositionModel(payload?.compositionModel || payload?.layout, communType),
          writingStyle: resolveWritingStyle(payload?.writingStyle || payload?.style, communType),
          liensWeb: (Array.isArray(payload?.liensWeb) ? payload.liensWeb : [])
            .map((l: any, i: number) => ({
              ...l,
              id: l?.id || `l-${i}`,
              url: ensureAbsoluteUrl(l?.url || ''),
            }))
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
      } catch (error) {
        console.error('Erreur fetchMemorial:', error);
        router.push('/');
      }
    };

    void fetchMemorial();
  }, [params, router]);

  const currentTemplate = useMemo(() => {
    if (!memorial) return null;
    return applyTypographyPreference(
      buildThemeTemplate(memorial.visualTheme, memorial.communType),
      resolveTypographyPreference(memorial.textTypography)
    );
  }, [memorial]);

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

  if (!memorial || !currentTemplate) {
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
            Ce mémorial n'est pas accessible pour le moment. Merci de contacter l'agence ou la famille référencée.
          </p>
        </div>
      </main>
    );
  }

  if (memorial?.access_level === 'restreint') {
    return (
      <main className="min-h-screen bg-[#F7F7F5] px-6 py-24">
        <div className="mx-auto max-w-2xl rounded-2xl border border-[#E5E7EB] bg-white p-8 text-center">
          <h1 className="text-2xl font-semibold text-[#1F2B35]">Accès restreint</h1>
          <p className="mt-3 text-sm text-[#5E6B78]">
            Ce mémorial n'est pas accessible publiquement pour le moment. Son accès sera configuré par la personne responsable.
          </p>
        </div>
      </main>
    );
  }

  if (memorial?.access_level === 'a_definir_plus_tard') {
    return (
      <main className="min-h-screen bg-[#F7F7F5] px-6 py-24">
        <div className="mx-auto max-w-2xl rounded-2xl border border-[#E5E7EB] bg-white p-8 text-center">
          <h1 className="text-2xl font-semibold text-[#1F2B35]">Accès en attente</h1>
          <p className="mt-3 text-sm text-[#5E6B78]">
            Ce mémorial a bien été préparé, mais son mode d'accès n'a pas encore été confirmé.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen" style={{ backgroundColor: currentTemplate.colors.bg }}>
      <PublishedMemorialRenderer
        memorial={memorial}
        communType={memorial.communType}
        memorialId={String(params?.id || '')}
        currentTemplate={currentTemplate}
        compositionModel={memorial.compositionModel}
        visualTheme={memorial.visualTheme}
        writingStyle={memorial.writingStyle}
        profilePhotoUrl={profilePhotoUrl}
        galleryMediasWithUrls={galleryMediasWithUrls}
        audioUrl={audioUrl}
        audioTitle={audioTitle || memorial?.gouts?.musique}
        showActions
        backHref="/"
        backLabel="Retour"
        onShare={handleShare}
      />

      <div className="max-w-7xl mx-auto px-4 pb-8 flex justify-end">
        <ReportButton />
      </div>

      <Footer />
    </main>
  );
}
