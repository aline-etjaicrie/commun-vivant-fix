'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, Music, Image as ImageIcon, Check, Loader2 } from 'lucide-react';
import FlowNotice from '@/components/create/FlowNotice';
import PhotoUploader from '@/components/PhotoUploader';
import GalleryUploader from '@/components/GalleryUploader';
import Mp3LibraryPicker from '@/components/Mp3LibraryPicker';
import { supabase } from '@/lib/supabase';
import { getOrCreateMemorialId } from '@/lib/paymentHelpers';
import { resolveCommunTypeFromPayload } from '@/lib/almaProfiles';
import { getPhoto, savePhoto, fileToBlob } from '@/lib/indexedDB';
import { CommunType, getLegacyContextForCommunType } from '@/lib/communTypes';
import {
  STORAGE_KEYS,
  getAnyAlmaConversationRaw,
  getFinalizationRaw,
  getQuestionnaireDataRaw,
  getQuestionnaireDraftKey,
} from '@/lib/creationFlowStorage';

export default function MediasPage() {
  const router = useRouter();
  const [memorialId] = useState(() => getOrCreateMemorialId());
  const [profilePhotoId, setProfilePhotoId] = useState<string | undefined>(undefined);
  const [galleryPhotos, setGalleryPhotos] = useState<any[]>([]);
  const [audioFile, setAudioFile] = useState<string | null>(null);
  const [audioTitle, setAudioTitle] = useState<string | null>(null);
  const [audioLibraryTrackId, setAudioLibraryTrackId] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<string>('none');
  const [presentationMode, setPresentationMode] = useState<boolean>(false);
  const [communType, setCommunType] = useState<string>('deces');
  const [proposedThemes, setProposedThemes] = useState<string[]>([]);
  const [selectedThemes, setSelectedThemes] = useState<string[]>([]);
  const [customTheme, setCustomTheme] = useState('');
  const [isAnalyzingThemes, setIsAnalyzingThemes] = useState(false);
  const [feedback, setFeedback] = useState<{
    variant: 'error' | 'info' | 'success';
    title: string;
    message: string;
  } | null>(null);

  const parseJsonResponse = async (response: Response) => {
    const raw = await response.text();
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return { error: raw.trim() || 'Réponse serveur illisible' };
    }
  };

  // États de protection d'accès
  const [isCheckingAccess, setIsCheckingAccess] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  const checkAccess = useCallback(async () => {
    try {
      const buildQuestionnaireUrl = (type: CommunType = 'deces') => {
        const context = getLegacyContextForCommunType(type);
        return `/create/questionnaire?communType=${encodeURIComponent(type)}&context=${encodeURIComponent(context)}`;
      };

      // 2. Vérifier qu'il y a des données de conversation
      const almaData = getAnyAlmaConversationRaw();

      const questionnaireData = getQuestionnaireDataRaw();
      const questionnaireDraftKey = getQuestionnaireDraftKey();
      const questionnaireDraftData = questionnaireDraftKey ? localStorage.getItem(questionnaireDraftKey) : null;
      const finalizationRaw = getFinalizationRaw();
      const flowRaw = localStorage.getItem(STORAGE_KEYS.creationFlow);

      let detectedCommunType: CommunType = 'deces';

      if (finalizationRaw) {
        try {
          const parsed = JSON.parse(finalizationRaw);
          detectedCommunType = resolveCommunTypeFromPayload(parsed?.communType) as CommunType;
          setCommunType(detectedCommunType);
          if (parsed?.context) {
            localStorage.setItem(STORAGE_KEYS.context, String(parsed.context));
          }
        } catch {
          setCommunType('deces');
        }
      } else if (flowRaw) {
        try {
          const flow = JSON.parse(flowRaw);
          detectedCommunType = resolveCommunTypeFromPayload(flow?.communType) as CommunType;
          setCommunType(detectedCommunType);
          if (flow?.context) {
            localStorage.setItem(STORAGE_KEYS.context, String(flow.context));
          }
        } catch {
          setCommunType('deces');
        }
      } else if (questionnaireData || questionnaireDraftData) {
        try {
          const parsedQ = JSON.parse(questionnaireData || questionnaireDraftData || '{}');
          detectedCommunType = resolveCommunTypeFromPayload(parsedQ?.communType) as CommunType;
          setCommunType(detectedCommunType);
        } catch {
          setCommunType('deces');
        }
      }

      if (!almaData && !questionnaireData && !questionnaireDraftData) {
        // Aucune donnée → rediriger vers la création
        console.warn("No conversation data found");
        router.push(buildQuestionnaireUrl(detectedCommunType));
        return;
      }

      // Acces accorde pour un parcours usager fluide.
      const savedThemesRaw = localStorage.getItem(STORAGE_KEYS.imageThemes);
      if (savedThemesRaw) {
        try {
          const parsed = JSON.parse(savedThemesRaw);
          if (Array.isArray(parsed)) {
            const cleaned = parsed.map((v) => String(v)).filter(Boolean).slice(0, 20);
            setSelectedThemes(cleaned);
          }
        } catch {
          // no-op
        }
      }
      setHasAccess(true);
      setIsCheckingAccess(false);
    } catch (error) {
      console.error('Error checking access:', error);
      setIsCheckingAccess(false);
      router.push('/create/questionnaire?communType=deces&context=funeral');
    }
  }, [router]);

  // Verification de l'acces au parcours de creation
  useEffect(() => {
    void checkAccess();
  }, [checkAccess]);

  useEffect(() => {
    const savedMediaRaw = localStorage.getItem(STORAGE_KEYS.mediaData);
    if (!savedMediaRaw) return;

    try {
      const savedMedia = JSON.parse(savedMediaRaw);
      setProfilePhotoId(savedMedia?.profilePhotoId || undefined);
      setGalleryPhotos(Array.isArray(savedMedia?.galleryPhotos) ? savedMedia.galleryPhotos : []);
      setAudioFile(typeof savedMedia?.audioFile === 'string' ? savedMedia.audioFile : null);
      setAudioTitle(typeof savedMedia?.audioTitle === 'string' ? savedMedia.audioTitle : null);
      setAudioLibraryTrackId(typeof savedMedia?.audioLibraryTrackId === 'string' ? savedMedia.audioLibraryTrackId : null);
      setSelectedFilter(typeof savedMedia?.selectedFilter === 'string' ? savedMedia.selectedFilter : 'none');
      setPresentationMode(Boolean(savedMedia?.presentationMode));

      if (Array.isArray(savedMedia?.imageThemes)) {
        setSelectedThemes(savedMedia.imageThemes.map((value: unknown) => String(value)).filter(Boolean).slice(0, 20));
      }
    } catch (error) {
      console.warn('Impossible de relire les médias sauvegardés', error);
    }
  }, []);

  // Afficher un loader pendant la vérification
  if (isCheckingAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-memoir-blue/5 via-white to-memoir-gold/5">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-memoir-blue mx-auto mb-4" />
          <p className="text-memoir-blue/70">Vérification de l'accès...</p>
        </div>
      </div>
    );
  }

  // Ne rien afficher si pas d'accès (la redirection est en cours)
  if (!hasAccess) {
    return null;
  }

  const blobToDataUrl = async (blob: Blob): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(String(reader.result || ''));
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(blob);
    });

  const collectImageDataUrls = async (): Promise<string[]> => {
    const ids: string[] = [];
    if (profilePhotoId) ids.push(profilePhotoId);
    for (const media of galleryPhotos) {
      if (typeof media?.url === 'string' && media.url.startsWith('indexed-db:')) {
        ids.push(media.url.replace('indexed-db:', ''));
      }
    }
    const uniqueIds = Array.from(new Set(ids)).slice(0, 8);
    const urls: string[] = [];
    for (const id of uniqueIds) {
      const photo = await getPhoto(id);
      if (!photo?.blob) continue;
      urls.push(await blobToDataUrl(photo.blob));
    }
    return urls;
  };

  const persistSelectedThemes = async (themes: string[]) => {
    const cleaned = themes.map((v) => v.trim()).filter(Boolean).slice(0, 20);
    setSelectedThemes(cleaned);
    localStorage.setItem(STORAGE_KEYS.imageThemes, JSON.stringify(cleaned));

    try {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) return;
      await fetch(`/api/user-dashboard/memorials/${memorialId}/image-themes`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ themes: cleaned }),
      });
    } catch {
      // keep local fallback only
    }
  };

  const handleAnalyzeThemes = async () => {
    setIsAnalyzingThemes(true);
    setFeedback(null);
    try {
      const images = await collectImageDataUrls();
      if (images.length === 0) {
        setFeedback({
          variant: 'info',
          title: 'Ajoutez d abord un repere visuel',
          message: 'Une photo principale ou quelques images de galerie nous aideront a proposer des themes vraiment utiles.',
        });
        return;
      }

      const response = await fetch('/api/analyze-media-themes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memory_id: memorialId, image_urls: images }),
      });
      const payload = await parseJsonResponse(response);
      if (!response.ok) {
        throw new Error(payload?.error || 'Analyse impossible');
      }

      const next = Array.isArray(payload?.proposedThemes) ? payload.proposedThemes : [];
      setProposedThemes(next);
      await persistSelectedThemes(next);
      setFeedback({
        variant: 'success',
        title: 'Les thèmes proposés sont prêts',
        message: 'Vous pouvez les garder, en retirer certains, ou ajouter vos propres mots pour affiner encore.',
      });
    } catch (error: any) {
      setFeedback({
        variant: 'error',
        title: "L’analyse visuelle n’est pas disponible pour le moment",
        message: error?.message || 'Vous pouvez poursuivre sans cette aide, puis revenir plus tard si vous le souhaitez.',
      });
    } finally {
      setIsAnalyzingThemes(false);
    }
  };

  const toggleTheme = async (theme: string) => {
    const exists = selectedThemes.includes(theme);
    const next = exists
      ? selectedThemes.filter((v) => v !== theme)
      : [...selectedThemes, theme].slice(0, 20);
    await persistSelectedThemes(next);
  };

  const addCustomTheme = async () => {
    const value = customTheme.trim();
    if (!value) return;
    if (selectedThemes.includes(value)) {
      setCustomTheme('');
      return;
    }
    await persistSelectedThemes([...selectedThemes, value]);
    setCustomTheme('');
  };

  const handleContinue = () => {
    // Sauvegarder une version legere des medias dans localStorage.
    // Evite QuotaExceededError quand un fichier audio est charge en base64.
    const mediaData = {
      profilePhotoId,
      galleryPhotos,
      audioFile, // URL (bibliothèque) ou pointeur indexed-db:...
      audioTitle,
      audioLibraryTrackId,
      hasUploadedAudio: Boolean(audioFile && !audioLibraryTrackId),
      selectedFilter,
      presentationMode,
      imageThemes: selectedThemes,
      memorialId,
    };
    try {
      localStorage.setItem(STORAGE_KEYS.mediaData, JSON.stringify(mediaData));
      localStorage.setItem(STORAGE_KEYS.currentMemorialId, memorialId);
    } catch (error) {
      console.warn('mediaData too large for localStorage, storing minimal payload');
      const minimalMediaData = {
        profilePhotoId,
        galleryPhotos,
        audioTitle,
        audioLibraryTrackId,
        selectedFilter,
        presentationMode,
        imageThemes: selectedThemes,
        memorialId,
      };
      localStorage.setItem(STORAGE_KEYS.mediaData, JSON.stringify(minimalMediaData));
      localStorage.setItem(STORAGE_KEYS.currentMemorialId, memorialId);
    }

    // Rediriger vers la génération du texte (route stable non dynamique)
    router.push(`/dashboard/generate?memoryId=${encodeURIComponent(memorialId)}`);
  };

  const canContinue = true; // Ne pas bloquer le parcours si la photo de profil n'est pas encore ajoutee

  return (
    <div className="min-h-screen bg-gradient-to-br from-memoir-blue/5 via-white to-memoir-gold/5 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-memoir-blue mb-2">
            Ajoutez des médias
          </h1>
          <p className="text-memoir-blue/70">
            Photos, sons et repères visuels pour donner une vraie présence à cet espace
          </p>
        </div>

        {feedback && (
          <FlowNotice
            variant={feedback.variant}
            title={feedback.title}
            message={feedback.message}
            className="mb-6"
          />
        )}

        <div className="space-y-8">
          {/* Photo de profil */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-memoir-blue/10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-memoir-gold/20 flex items-center justify-center">
                <ImageIcon className="w-5 h-5 text-memoir-gold" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-memoir-blue">Photo de profil</h2>
                <p className="text-sm text-memoir-blue/60">La photo principale du mémorial</p>
              </div>
            </div>
            <PhotoUploader
              photoId={profilePhotoId}
              onPhotoChange={setProfilePhotoId}
              memorialId={memorialId}
              label="Photo de profil"
              filter={selectedFilter}
            />
          </div>

          {/* Filtre photo */}
          {profilePhotoId && (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-memoir-blue/10">
              <h3 className="text-lg font-semibold text-memoir-blue mb-4">Style de photo</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { value: 'none', label: 'Original' },
                  { value: 'sepia', label: 'Sépia' },
                  { value: 'bw', label: 'Noir & Blanc' },
                  { value: 'enhanced', label: 'Amélioré' },
                ].map((filter) => (
                  <button
                    key={filter.value}
                    onClick={() => setSelectedFilter(filter.value)}
                    className={`px-4 py-3 rounded-lg border-2 transition-all ${selectedFilter === filter.value
                      ? 'border-memoir-gold bg-memoir-gold/10 text-memoir-gold font-medium'
                      : 'border-memoir-blue/20 text-memoir-blue/70 hover:border-memoir-gold/50'
                      }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Galerie photos */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-memoir-blue/10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-memoir-gold/20 flex items-center justify-center">
                <ImageIcon className="w-5 h-5 text-memoir-gold" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-memoir-blue">Galerie photos</h2>
                <p className="text-sm text-memoir-blue/60">Autres photos et souvenirs (optionnel)</p>
              </div>
            </div>
            <GalleryUploader
              medias={galleryPhotos}
              onMediasChange={setGalleryPhotos}
              memorialId={memorialId}
            />
          </div>

          {/* Audio */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-memoir-blue/10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-memoir-gold/20 flex items-center justify-center">
                <Music className="w-5 h-5 text-memoir-gold" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-memoir-blue">Musique ou message audio</h2>
                <p className="text-sm text-memoir-blue/60">Une musique importante ou un message vocal (optionnel)</p>
              </div>
            </div>
            <input
              type="file"
              accept="audio/*"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (file) {
                  try {
                    setFeedback(null);
                    const id = `audio-${memorialId}-${Date.now()}`;
                    const blob = await fileToBlob(file);
                    await savePhoto({
                      id,
                      memorialId,
                      type: 'audio',
                      blob,
                      nom: file.name,
                    });
                    setAudioFile(`indexed-db:${id}`);
                    setAudioTitle(file.name);
                    setAudioLibraryTrackId(null);
                  } catch (error) {
                    console.error('Erreur upload audio', error);
                    setFeedback({
                      variant: 'error',
                      title: "Le fichier audio n’a pas encore pu être ajouté",
                      message: 'Vous pouvez réessayer avec un autre fichier, ou continuer sans audio pour le moment.',
                    });
                  }
                }
              }}
              className="block w-full text-sm text-memoir-blue/70
                file:mr-4 file:py-2 file:px-4
                file:rounded-lg file:border-0
                file:text-sm file:font-medium
                file:bg-memoir-gold file:text-white
                file:cursor-pointer
                hover:file:bg-memoir-gold/90"
            />
            {audioFile && (
              <div className="mt-3">
                {audioFile.startsWith('indexed-db:') ? (
                  <p className="text-xs text-memoir-blue/70">Audio local enregistré ({audioTitle || 'fichier audio'})</p>
                ) : (
                  <audio controls className="w-full">
                    <source src={audioFile} />
                  </audio>
                )}
              </div>
            )}

            {communType === 'deces' && (
              <div className="mt-6 border-t border-memoir-blue/10 pt-4">
                <h3 className="mb-1 text-sm font-semibold text-memoir-blue">Suggestions audio d’ambiance</h3>
                <p className="mb-3 text-xs text-memoir-blue/60">Optionnel: choisissez une piste instrumentale si vous n’avez pas de fichier audio sous la main.</p>
                <Mp3LibraryPicker
                  selectedTrackId={audioLibraryTrackId || undefined}
                  onSelectTrack={(track) => {
                    if (!track) {
                      setAudioLibraryTrackId(null);
                      return;
                    }
                    setAudioLibraryTrackId(track.id);
                    setAudioFile(track.url);
                    setAudioTitle(track.title);
                  }}
                />
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-memoir-blue/10">
            <h2 className="text-xl font-semibold text-memoir-blue mb-2">Présentation images fluide</h2>
            <p className="text-sm text-memoir-blue/60 mb-4">
              Active un mode diaporama automatique dans la galerie finale du mémorial.
            </p>
            <label className="inline-flex items-center gap-2 text-sm text-memoir-blue">
              <input
                type="checkbox"
                checked={presentationMode}
                onChange={(e) => setPresentationMode(e.target.checked)}
              />
              Activer la présentation fluide
            </label>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-memoir-blue/10">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold text-memoir-blue">Ce que racontent vos images</h2>
                <p className="text-sm text-memoir-blue/60">L’IA propose des ambiances à partir de vos photos, puis vous gardez la main pour valider, retirer ou compléter.</p>
              </div>
              <button
                onClick={handleAnalyzeThemes}
                disabled={isAnalyzingThemes}
                className="rounded-lg border px-4 py-2 text-sm disabled:opacity-50"
              >
                {isAnalyzingThemes ? 'Analyse en cours...' : 'Lancer une première analyse'}
              </button>
            </div>

            {proposedThemes.length > 0 && (
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {proposedThemes.map((theme) => (
                  <label key={theme} className="flex items-center gap-2 rounded-lg border p-2 text-sm">
                    <input
                      type="checkbox"
                      checked={selectedThemes.includes(theme)}
                      onChange={() => toggleTheme(theme)}
                    />
                    {theme}
                  </label>
                ))}
              </div>
            )}

            <div className="mt-4 flex flex-wrap gap-2">
              <input
                value={customTheme}
                onChange={(e) => setCustomTheme(e.target.value)}
                placeholder="Ajouter un thème à retenir"
                className="min-w-[220px] flex-1 rounded-lg border px-3 py-2 text-sm"
              />
              <button onClick={addCustomTheme} className="rounded-lg border px-4 py-2 text-sm">
                Ajouter
              </button>
            </div>

            {selectedThemes.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {selectedThemes.map((theme) => (
                  <span key={theme} className="rounded-full bg-memoir-gold/10 px-3 py-1 text-xs text-memoir-blue">
                    {theme}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Bouton continuer */}
        <div className="mt-8 flex justify-center">
          <button
            onClick={handleContinue}
            disabled={!canContinue}
            className="flex items-center gap-2 px-8 py-4 bg-memoir-gold text-white rounded-lg font-medium text-lg hover:bg-memoir-gold/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            <Check className="w-5 h-5" />
            Continuer vers la génération du texte
          </button>
        </div>

        {!profilePhotoId && (
          <p className="text-center text-sm text-memoir-blue/60 mt-3">
            Vous pouvez continuer maintenant et ajouter la photo plus tard.
          </p>
        )}
      </div>
    </div>
  );
}
