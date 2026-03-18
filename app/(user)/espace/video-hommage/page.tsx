'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import UserDashboardShell from '@/components/user-dashboard/UserDashboardShell';
import { useUserDashboard } from '@/lib/user-dashboard/useUserDashboard';
import { createClient } from '@/lib/supabase/client';
import { VIDEO_TEMPLATES, VideoTemplateId } from '@/lib/video/templates';
import { MEMORIAL_MP3_LIBRARY } from '@/lib/mp3Library';
import { CommunType, getCommunTypeConfig } from '@/lib/communTypes';
import { optimizeImageFile } from '@/lib/client/imageOptimization';

type ToneMode = 'sobre-intemporel' | 'souvenir-vivant' | 'chaleur-memoire';

interface VideoJobState {
  id: string;
  status: string;
  progress: number;
  downloadUrl?: string;
}

interface VideoCopy {
  pageTitle: string;
  pageSubtitle: string;
  introLine1: string;
  introLine2: string;
  introLine3: string;
  expressCta: string;
  expressConfirm: string;
  generateCta: string;
  statusRunningTitle: string;
  statusRunningBody: string;
  statusReadyTitle: string;
  downloadCta: string;
  shareCta: string;
  regenerateCta: string;
}

function getVideoCopy(communType: CommunType): VideoCopy {
  if (communType === 'hommage-vivant') {
    return {
      pageTitle: 'Creer une video de fete',
      pageSubtitle: 'Un film simple et elegant pour celebrer une personne vivante et partager ce moment.',
      introLine1: 'A partir de vos photos et du texte redige, nous generons une video claire et chaleureuse.',
      introLine2: '30 photos incluses. Duree moyenne : 2 a 3 minutes.',
      introLine3: 'Vous pourrez la telecharger et la partager avec vos proches.',
      expressCta: 'Generer automatiquement une video de fete sobre',
      expressConfirm: 'Generer automatiquement une video de fete ?',
      generateCta: 'Generer la video de fete',
      statusRunningTitle: 'Votre video de fete est en cours de creation',
      statusRunningBody: 'Vous pouvez quitter cette page. Nous vous prevenons des que la video est prete.',
      statusReadyTitle: 'Votre video de fete est prete',
      downloadCta: 'Telecharger la video de fete',
      shareCta: 'Partager la video de fete',
      regenerateCta: 'Regenerer la video avec un autre style',
    };
  }

  if (communType === 'transmission-familiale') {
    return {
      pageTitle: 'Creer une video de transmission',
      pageSubtitle: 'Un film sobre pour transmettre une histoire familiale a vos proches.',
      introLine1: 'A partir de vos photos et du texte redige, nous generons une video lisible et durable.',
      introLine2: '30 photos incluses. Duree moyenne : 2 a 3 minutes.',
      introLine3: 'Vous pourrez la telecharger et la partager a votre famille.',
      expressCta: 'Generer automatiquement une video de transmission sobre',
      expressConfirm: 'Generer automatiquement une video de transmission ?',
      generateCta: 'Generer la video de transmission',
      statusRunningTitle: 'Votre video de transmission est en cours de creation',
      statusRunningBody: 'Vous pouvez quitter cette page. Nous vous prevenons des que la video est prete.',
      statusReadyTitle: 'Votre video de transmission est prete',
      downloadCta: 'Telecharger la video de transmission',
      shareCta: 'Partager la video de transmission',
      regenerateCta: 'Regenerer la video avec un autre style',
    };
  }

  return {
    pageTitle: 'Creer une video hommage',
    pageSubtitle: 'Un film simple et elegant, a projeter pendant la ceremonie ou a partager avec vos proches.',
    introLine1: 'A partir de vos photos et du texte redige, nous generons automatiquement une video sobre et respectueuse.',
    introLine2: '30 photos incluses. Duree moyenne : 2 a 3 minutes.',
    introLine3: 'Vous pourrez la telecharger et la partager.',
    expressCta: 'Generer automatiquement une video hommage sobre',
    expressConfirm: 'Generer automatiquement une video hommage ?',
    generateCta: 'Generer la video hommage',
    statusRunningTitle: 'Votre video hommage est en cours de creation',
    statusRunningBody: 'Vous pouvez quitter cette page. Nous vous previendrons lorsqu elle sera prete.',
    statusReadyTitle: 'Votre video hommage est prete',
    downloadCta: 'Telecharger la video hommage',
    shareCta: 'Partager la video hommage',
    regenerateCta: 'Regenerer la video avec un autre style',
  };
}

function TemplatePreview({ templateId }: { templateId: VideoTemplateId }) {
  if (templateId === 'classique-sobre') {
    return (
      <div className="relative mb-3 h-16 overflow-hidden rounded-lg border border-[#E5E7EB] bg-black">
        <div className="absolute inset-0 animate-pulse bg-gradient-to-b from-white/10 to-black/10" />
        <div className="absolute inset-x-4 top-6 h-1 rounded bg-white/60" />
      </div>
    );
  }

  if (templateId === 'galerie-vivante') {
    return (
      <div className="relative mb-3 h-16 overflow-hidden rounded-lg border border-[#E5E7EB] bg-[#F5F7FA]">
        <div className="absolute left-2 top-2 h-12 w-8 animate-bounce rounded bg-[#DCE3EA]" style={{ animationDuration: '2.6s' }} />
        <div className="absolute left-12 top-3 h-10 w-10 animate-pulse rounded bg-[#C8D4DF]" />
        <div className="absolute right-2 top-2 h-12 w-12 animate-bounce rounded bg-[#BFCFDA]" style={{ animationDuration: '3.2s' }} />
      </div>
    );
  }

  if (templateId === 'cinematique-douce') {
    return (
      <div className="relative mb-3 h-16 overflow-hidden rounded-lg border border-[#E5E7EB] bg-[#1F2B35]">
        <div className="absolute -left-6 top-2 h-12 w-20 rounded bg-white/15" style={{ animation: 'pulse 2.8s ease-in-out infinite' }} />
        <div className="absolute right-3 top-3 h-10 w-10 rounded bg-white/20" style={{ animation: 'pulse 3.6s ease-in-out infinite' }} />
        <div className="absolute inset-x-3 bottom-2 h-1 rounded bg-white/40" />
      </div>
    );
  }

  return (
    <div className="relative mb-3 h-16 overflow-hidden rounded-lg border border-[#E5E7EB] bg-[#F8F2E8]">
      <div className="absolute left-4 top-2 h-11 w-9 rotate-[-3deg] rounded-sm border-[3px] border-white bg-[#D9C4AA] shadow-sm" />
      <div className="absolute left-14 top-3 h-10 w-8 rotate-[2deg] rounded-sm border-[3px] border-white bg-[#E3D2BC] shadow-sm" style={{ animation: 'pulse 3s ease-in-out infinite' }} />
      <div className="absolute right-5 top-2 h-11 w-9 rotate-[-2deg] rounded-sm border-[3px] border-white bg-[#CDB294] shadow-sm" />
    </div>
  );
}

const MUSIC_CHOICES = [
  { id: 'piano-doux', label: 'Piano doux', fallbackTrackId: 'solennite-piano' },
  { id: 'guitare-acoustique', label: 'Guitare acoustique', fallbackTrackId: 'douce-lumiere' },
  { id: 'instrumental-minimal', label: 'Instrumental minimal', fallbackTrackId: 'presence-sobre' },
];

function toMusicTrackUrl(musicId: string): string {
  const choice = MUSIC_CHOICES.find((m) => m.id === musicId);
  const track = MEMORIAL_MP3_LIBRARY.find((t) => t.id === choice?.fallbackTrackId);
  return track?.url || '';
}

function resolveTemplateLabel(templateId: VideoTemplateId): string {
  return VIDEO_TEMPLATES[templateId]?.label || templateId;
}

export default function EspaceVideoHommagePage() {
  const { data, loading } = useUserDashboard();
  const supabase = createClient();

  const [memoryId, setMemoryId] = useState('');
  const [templateId, setTemplateId] = useState<VideoTemplateId>('classique-sobre');
  const [toneMode, setToneMode] = useState<ToneMode>('sobre-intemporel');
  const [musicId, setMusicId] = useState('piano-doux');
  const [textSnippets, setTextSnippets] = useState<string[]>(['', '', '']);

  const [allPhotoIds, setAllPhotoIds] = useState<string[]>([]);
  const [orderedPhotoIds, setOrderedPhotoIds] = useState<string[]>([]);
  const [mobilePhotoUrls, setMobilePhotoUrls] = useState<string[]>([]);
  const [unlockExtraPhotos, setUnlockExtraPhotos] = useState(false);
  const [autoSelectThirty, setAutoSelectThirty] = useState(true);

  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');
  const [job, setJob] = useState<VideoJobState | null>(null);

  const memorialOptions = useMemo(
    () => (data.memorials || []).filter((memory) => memory.canAdminister),
    [data.memorials]
  );
  const selectedMemorial = memorialOptions.find((m) => m.id === memoryId);
  const selectedThemes = useMemo(
    () => selectedMemorial?.imageThemes || [],
    [selectedMemorial?.imageThemes]
  );
  const selectedPhotoIds = mobilePhotoUrls.length > 0 ? mobilePhotoUrls : orderedPhotoIds;
  const communType = (selectedMemorial?.communType || 'deces') as CommunType;
  const communConfig = getCommunTypeConfig(communType);
  const copy = getVideoCopy(communType);

  useEffect(() => {
    if (!memoryId) return;
    let cancelled = false;

    const loadPhotos = async () => {
      setError('');
      try {
        const { data: session } = await supabase.auth.getSession();
        const token = session.session?.access_token;
        if (!token) throw new Error('Session manquante');

        const res = await fetch(`/api/videos/photos?memory_id=${encodeURIComponent(memoryId)}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const payload = await res.json();
        if (!res.ok) throw new Error(payload?.error || 'Photos indisponibles');

        const ids = Array.isArray(payload?.photo_ids) ? payload.photo_ids.map((v: unknown) => String(v)) : [];
        if (cancelled) return;
        setAllPhotoIds(ids);

        if (ids.length > 30) {
          setOrderedPhotoIds(ids.slice(0, 30));
        } else {
          setOrderedPhotoIds(ids);
        }
      } catch (e: any) {
        if (!cancelled) setError(e?.message || 'Impossible de charger les photos');
      }
    };

    loadPhotos();
    return () => {
      cancelled = true;
    };
  }, [memoryId, supabase.auth]);

  useEffect(() => {
    if (selectedMemorial && textSnippets.every((s) => !s.trim())) {
      const fallback = [
        selectedMemorial.title,
        selectedThemes[0] ? `Theme: ${selectedThemes[0]}` : 'Un souvenir partage',
        selectedThemes[1] ? `Theme: ${selectedThemes[1]}` : 'Un lien qui reste',
      ];
      setTextSnippets(fallback.slice(0, 3));
    }
  }, [selectedMemorial, selectedThemes, textSnippets]);

  useEffect(() => {
    if (!job?.id) return;
    if (!['queued', 'rendering'].includes(job.status)) return;

    const timer = setInterval(async () => {
      try {
        const { data: session } = await supabase.auth.getSession();
        const token = session.session?.access_token;
        if (!token) return;

        const res = await fetch(`/api/videos/${job.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const payload = await res.json();
        if (!res.ok) return;

        setJob({
          id: payload.id,
          status: payload.status,
          progress: Number(payload.progress || 0),
          downloadUrl: payload.download_url || undefined,
        });
      } catch {
        // keep silent, manual refresh still available
      }
    }, 5000);

    return () => clearInterval(timer);
  }, [job, supabase.auth]);

  const canGenerate = memoryId.length > 0 && selectedPhotoIds.length > 0 && textSnippets.filter((s) => s.trim()).length >= 3;

  const applyPhotoLimitPolicy = () => {
    if (allPhotoIds.length <= 30) return allPhotoIds;
    if (unlockExtraPhotos) {
      throw new Error('Option photos supplementaires non activee pour le moment.');
    }
    if (autoSelectThirty) return allPhotoIds.slice(0, 30);
    throw new Error('Selectionnez une option pour gerer la limite de 30 photos.');
  };

  const createVideo = async (expressMode = false) => {
    setError('');
    setIsCreating(true);
    try {
      const { data: session } = await supabase.auth.getSession();
      const token = session.session?.access_token;
      if (!token) throw new Error('Session manquante');

      const finalTemplateId: VideoTemplateId = expressMode ? 'classique-sobre' : templateId;
      const finalMusicId = expressMode ? 'piano-doux' : musicId;
      const finalTone: ToneMode = expressMode ? 'sobre-intemporel' : toneMode;
      const limitedPhotoIds =
        mobilePhotoUrls.length > 0
          ? mobilePhotoUrls.slice(0, 30)
          : expressMode
          ? allPhotoIds.slice(0, 30)
          : applyPhotoLimitPolicy();
      const finalSnippets = expressMode
        ? [
            selectedMemorial?.title || 'Souvenir',
            'Un film simple et respectueux',
            'Merci pour cette presence',
          ]
        : textSnippets.map((s) => s.trim()).filter(Boolean).slice(0, 6);

      const payloadSnippets = [`Ambiance: ${finalTone}`, ...finalSnippets];

      const res = await fetch('/api/videos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          memory_id: memoryId,
          template_id: finalTemplateId,
          music_id: finalMusicId,
          ...(mobilePhotoUrls.length > 0 ? { image_urls: limitedPhotoIds } : { photo_ids: limitedPhotoIds }),
          text_snippets: payloadSnippets,
        }),
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload?.error || 'Generation impossible');

      setJob({
        id: payload.video.id,
        status: payload.video.status,
        progress: Number(payload.video.progress || 0),
      });
    } catch (e: any) {
      setError(e?.message || 'Erreur generation video');
    } finally {
      setIsCreating(false);
    }
  };

  const refreshJob = async () => {
    if (!job?.id) return;
    setError('');
    try {
      const { data: session } = await supabase.auth.getSession();
      const token = session.session?.access_token;
      if (!token) throw new Error('Session manquante');

      const res = await fetch(`/api/videos/${job.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload?.error || 'Statut indisponible');

      setJob({
        id: payload.id,
        status: payload.status,
        progress: Number(payload.progress || 0),
        downloadUrl: payload.download_url || undefined,
      });
    } catch (e: any) {
      setError(e?.message || 'Erreur statut video');
    }
  };

  if (loading) {
    return (
      <UserDashboardShell title="Creer une video" subtitle="Chargement...">
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-4 text-sm text-[#6B7280]">Chargement...</div>
      </UserDashboardShell>
    );
  }

  return (
    <UserDashboardShell
      title={copy.pageTitle}
      subtitle={copy.pageSubtitle}
    >
      <section className="rounded-2xl border border-[#E5E7EB] bg-white p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm text-[#4B5563]">
              {copy.introLine1}
            </p>
            <p className="mt-1 text-sm text-[#4B5563]">{copy.introLine2}</p>
            <p className="mt-1 text-sm text-[#4B5563]">{copy.introLine3}</p>
            <p className="mt-1 text-xs text-[#6B7280]">Type de commun: {communConfig.title}</p>
            <p className="mt-1 text-xs text-[#6B7280]">
              Cette action est reservee aux proprietaires et co-editeurs des espaces partages.
            </p>
          </div>
          <button
            onClick={() => {
              if (!memoryId) {
                setError('Selectionnez d abord un memorial.');
                return;
              }
              if (confirm(copy.expressConfirm)) {
                createVideo(true);
              }
            }}
            className="text-sm text-[#0B66C3] underline"
          >
            {copy.expressCta}
          </button>
        </div>
      </section>

      <section className="mt-5 rounded-2xl border border-[#E5E7EB] bg-white p-5">
        <h2 className="text-base font-semibold">Etape 0 - Memorial</h2>
        <label className="mt-3 block text-sm">
          <span className="mb-1 block text-[#374151]">Choisissez le memorial</span>
          <select
            value={memoryId}
            onChange={(e) => setMemoryId(e.target.value)}
            className="w-full rounded-lg border px-3 py-2 text-sm md:max-w-md"
          >
            <option value="">Selectionner</option>
            {memorialOptions.map((m) => (
              <option key={m.id} value={m.id}>
                {m.title}
              </option>
            ))}
          </select>
        </label>
        {memorialOptions.length === 0 ? (
          <p className="mt-2 text-xs text-[#6B7280]">
            Aucun memorial modifiable n est disponible pour la creation video.
          </p>
        ) : null}
      </section>

      <section className="mt-5 rounded-2xl border border-[#E5E7EB] bg-white p-5">
        <h2 className="text-base font-semibold">1. Choisir le style visuel</h2>
        <p className="mt-1 text-sm text-[#6B7280]">Choisissez l atmosphere qui correspond le mieux a votre proche.</p>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {(Object.keys(VIDEO_TEMPLATES) as VideoTemplateId[]).map((id) => {
            const selected = templateId === id;
            return (
              <button
                key={id}
                onClick={() => setTemplateId(id)}
                className={`rounded-xl border p-4 text-left transition-colors ${selected ? 'border-[#1B2D3E] bg-[#F6F8FA]' : 'border-[#E5E7EB] bg-white hover:bg-[#FAFAFA]'}`}
              >
                <TemplatePreview templateId={id} />
                <p className="font-medium">{resolveTemplateLabel(id)}</p>
                <p className="mt-1 text-xs text-[#6B7280]">
                  {id === 'classique-sobre' && 'Sobre, epure, adapte a une projection en ceremonie.'}
                  {id === 'galerie-vivante' && 'Un album fluide, organise en chapitres.'}
                  {id === 'cinematique-douce' && 'Des images animees avec delicatesse et profondeur.'}
                  {id === 'polaroid' && 'Des souvenirs poses comme des instants reveles.'}
                </p>
              </button>
            );
          })}
        </div>
      </section>

      <section className="mt-5 rounded-2xl border border-[#E5E7EB] bg-white p-5">
        <h2 className="text-base font-semibold">2. Ambiance emotionnelle</h2>
        <p className="mt-1 text-sm text-[#6B7280]">Quelle tonalite souhaitez-vous ?</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {[
            { id: 'sobre-intemporel', label: 'Sobre & intemporel' },
            { id: 'souvenir-vivant', label: 'Souvenir vivant' },
            { id: 'chaleur-memoire', label: 'Chaleur & memoire' },
          ].map((tone) => (
            <button
              key={tone.id}
              onClick={() => setToneMode(tone.id as ToneMode)}
              className={`rounded-full border px-4 py-2 text-sm ${toneMode === tone.id ? 'border-[#1B2D3E] bg-[#1B2D3E] text-white' : 'border-[#D1D5DB] bg-white'}`}
            >
              {tone.label}
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs text-[#6B7280]">
          Nous ajusterons automatiquement les transitions, le rythme et les silences.
        </p>
      </section>

      <section className="mt-5 rounded-2xl border border-[#E5E7EB] bg-white p-5">
        <h2 className="text-base font-semibold">3. Photos</h2>
        <p className="mt-1 text-sm text-[#6B7280]">30 photos incluses. Vous pouvez modifier l ordre si vous le souhaitez.</p>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <label className="rounded-lg border px-3 py-2 text-sm cursor-pointer">
            Ajouter depuis mon telephone
            <input
              type="file"
              accept="image/*"
              multiple
              capture="environment"
              className="hidden"
              onChange={async (e) => {
                const files = Array.from(e.target.files || []).slice(0, 30);
                if (files.length === 0) return;
                const toDataUrl = (file: File) =>
                  new Promise<string>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(String(reader.result || ''));
                    reader.onerror = () => reject(reader.error);
                    reader.readAsDataURL(file);
                  });
                try {
                  const optimizedFiles = await Promise.all(
                    files.map((f) =>
                      optimizeImageFile(f, {
                        maxWidth: 1920,
                        maxHeight: 1920,
                        quality: 0.8,
                      })
                    )
                  );
                  const urls = await Promise.all(optimizedFiles.map((f) => toDataUrl(f)));
                  setMobilePhotoUrls(urls.slice(0, 30));
                  setError('');
                } catch {
                  setError('Impossible de lire les photos du telephone.');
                }
              }}
            />
          </label>
          {mobilePhotoUrls.length > 0 ? (
            <button
              onClick={() => setMobilePhotoUrls([])}
              className="rounded-lg border px-3 py-2 text-sm"
            >
              Revenir aux photos du memorial
            </button>
          ) : null}
        </div>
        {mobilePhotoUrls.length > 0 ? (
          <p className="mt-2 text-xs text-[#6B7280]">
            Mode mobile direct actif: {mobilePhotoUrls.length} photo(s) selectionnee(s) depuis votre appareil.
          </p>
        ) : null}

        <div className="mt-3 flex flex-wrap gap-2">
          {selectedPhotoIds.slice(0, 12).map((id, idx) => (
            <div key={id} className="rounded-lg border border-[#E5E7EB] bg-[#FAFAFA] px-2 py-1 text-xs">
              {idx + 1}. {id.slice(0, 8)}
            </div>
          ))}
          {selectedPhotoIds.length > 12 ? (
            <div className="rounded-lg border border-[#E5E7EB] bg-[#FAFAFA] px-2 py-1 text-xs">+{selectedPhotoIds.length - 12}</div>
          ) : null}
        </div>

        {allPhotoIds.length > 30 ? (
          <div className="mt-4 rounded-lg border border-[#F3E8D4] bg-[#FFF9F2] p-3 text-sm">
            <p>Vous avez selectionne {allPhotoIds.length} photos. La video inclut 30 photos maximum.</p>
            <label className="mt-2 flex items-center gap-2">
              <input
                type="checkbox"
                checked={unlockExtraPhotos}
                onChange={(e) => setUnlockExtraPhotos(e.target.checked)}
              />
              Debloquer des photos supplementaires
            </label>
            <label className="mt-1 flex items-center gap-2">
              <input
                type="checkbox"
                checked={autoSelectThirty}
                onChange={(e) => setAutoSelectThirty(e.target.checked)}
              />
              Utiliser une selection automatique de 30 photos
            </label>
          </div>
        ) : null}
      </section>

      <section className="mt-5 rounded-2xl border border-[#E5E7EB] bg-white p-5">
        <h2 className="text-base font-semibold">4. Extraits du texte</h2>
        <p className="mt-1 text-sm text-[#6B7280]">Nous avons selectionne quelques phrases de votre texte. Vous pouvez les modifier.</p>
        <div className="mt-3 space-y-2">
          {[0, 1, 2, 3, 4, 5].map((idx) => (
            <input
              key={idx}
              value={textSnippets[idx] || ''}
              onChange={(e) =>
                setTextSnippets((prev) => {
                  const next = [...prev];
                  next[idx] = e.target.value;
                  return next;
                })
              }
              placeholder={`Phrase ${idx + 1}`}
              className="w-full rounded-lg border px-3 py-2 text-sm"
            />
          ))}
        </div>
      </section>

      <section className="mt-5 rounded-2xl border border-[#E5E7EB] bg-white p-5">
        <h2 className="text-base font-semibold">5. Musique</h2>
        <p className="mt-1 text-sm text-[#6B7280]">La musique sera discrete et adaptee au rythme des images.</p>
        <div className="mt-3 grid gap-2 md:grid-cols-3">
          {MUSIC_CHOICES.map((choice) => (
            <label key={choice.id} className="rounded-lg border border-[#E5E7EB] p-3 text-sm">
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={musicId === choice.id}
                  onChange={() => setMusicId(choice.id)}
                />
                <span>{choice.label}</span>
              </div>
              <audio className="mt-2 w-full" controls preload="none">
                <source src={toMusicTrackUrl(choice.id)} />
              </audio>
            </label>
          ))}
        </div>
      </section>

      <section className="mt-5 rounded-2xl border border-[#E5E7EB] bg-white p-5">
        <button
          disabled={!canGenerate || isCreating}
          onClick={() => createVideo(false)}
          className="rounded-lg bg-[#1B2D3E] px-5 py-3 text-sm font-medium text-white disabled:opacity-50"
        >
          {isCreating ? 'Generation en cours...' : copy.generateCta}
        </button>
        <p className="mt-2 text-xs text-[#6B7280]">La generation peut prendre 1 a 3 minutes. Vous serez informe(e) des qu elle sera prete.</p>
        {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
      </section>

      {job && ['queued', 'rendering'].includes(job.status) ? (
        <section className="mt-5 rounded-2xl border border-[#E5E7EB] bg-white p-5">
          <h2 className="text-base font-semibold">{copy.statusRunningTitle}</h2>
          <div className="mt-3 h-2 w-full rounded-full bg-[#E5E7EB]">
            <div className="h-2 rounded-full bg-[#1B2D3E]" style={{ width: `${Math.max(5, job.progress)}%` }} />
          </div>
          <p className="mt-2 text-sm text-[#6B7280]">{copy.statusRunningBody}</p>
          <button onClick={refreshJob} className="mt-3 rounded-lg border px-3 py-2 text-sm">Rafraichir</button>
        </section>
      ) : null}

      {job && job.status === 'completed' ? (
        <section className="mt-5 rounded-2xl border border-[#E5E7EB] bg-white p-5">
          <h2 className="text-base font-semibold">{copy.statusReadyTitle}</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {job.downloadUrl ? (
              <a href={job.downloadUrl} target="_blank" rel="noreferrer" className="rounded-lg bg-[#1B2D3E] px-4 py-2 text-sm text-white">
                {copy.downloadCta}
              </a>
            ) : (
              <button onClick={refreshJob} className="rounded-lg border px-4 py-2 text-sm">Obtenir le lien</button>
            )}
            <Link href="/espace/memoriaux" className="rounded-lg border px-4 py-2 text-sm">{copy.shareCta}</Link>
            <button
              onClick={() => {
                setJob(null);
                setError('');
              }}
              className="rounded-lg border px-4 py-2 text-sm"
            >
              {copy.regenerateCta}
            </button>
          </div>
        </section>
      ) : null}
    </UserDashboardShell>
  );
}
