'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import UserDashboardShell from '@/components/user-dashboard/UserDashboardShell';
import { useUserDashboard } from '@/lib/user-dashboard/useUserDashboard';
import { VIDEO_TEMPLATES, VideoTemplateId } from '@/lib/video/templates';
import { createClient } from '@/lib/supabase/client';
import { CommunType, getCommunTypeConfig } from '@/lib/communTypes';

function getMediaTone(communType?: string) {
  const type = (communType || 'deces') as CommunType;
  if (type === 'hommage-vivant') {
    return {
      title: 'Feter un vivant',
      hint: 'Pour celebrer un anniversaire, une etape ou un moment de gratitude.',
      videoCta: 'Creer une video de fete',
    };
  }
  if (type === 'transmission-familiale') {
    return {
      title: 'Transmettre une histoire',
      hint: 'Pour conserver des reperes familiaux et transmettre une memoire.',
      videoCta: 'Creer une video de transmission',
    };
  }
  return {
    title: 'Honorer une memoire',
    hint: 'Pour proposer un film sobre et partageable avec les proches.',
    videoCta: 'Creer une video hommage',
  };
}

export default function EspaceMediasPage() {
  const { data, loading } = useUserDashboard();
  const supabase = createClient();
  const [selectedMemoryId, setSelectedMemoryId] = useState<string>('');
  const [templateId, setTemplateId] = useState<VideoTemplateId>('classique-sobre');
  const [musicId, setMusicId] = useState('piano-doux');
  const [snippetsRaw, setSnippetsRaw] = useState('');
  const [videoJobId, setVideoJobId] = useState<string>('');
  const [videoStatus, setVideoStatus] = useState<string>('');
  const [videoProgress, setVideoProgress] = useState<number>(0);
  const [downloadUrl, setDownloadUrl] = useState<string>('');
  const [videoError, setVideoError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const memoryOptions = useMemo(
    () => (data.memorials || []).filter((memory) => memory.canAdminister),
    [data.memorials]
  );
  const selectedMemory = memoryOptions.find((m) => m.id === selectedMemoryId);
  const selectedTone = getMediaTone(selectedMemory?.communType);
  const globalTone = getMediaTone(memoryOptions[0]?.communType);

  if (loading) {
    return (
      <UserDashboardShell title="Medias" subtitle="Chargement...">
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-4 text-sm text-[#6B7280]">Chargement...</div>
      </UserDashboardShell>
    );
  }

  return (
    <UserDashboardShell title="Medias" subtitle="Photos, video, audio et organisation des contenus selon votre type de commun">
      <section className="rounded-2xl border border-[#E5E7EB] bg-white p-5">
        <h2 className="text-lg font-semibold">Gestion des uploads</h2>
        <p className="mt-2 text-sm text-[#6B7280]">Drag & drop, reorganisation, legende et suppression sont accessibles dans l'editeur medias.</p>
        <p className="mt-1 text-xs text-[#6B7280]">{globalTone.hint}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link href="/medias" className="rounded-lg bg-[#1B2D3E] px-4 py-2 text-sm font-medium text-white">Ouvrir l'editeur medias</Link>
          <Link href="/espace/video-hommage" className="rounded-lg border border-[#1B2D3E] px-4 py-2 text-sm font-medium text-[#1B2D3E]">
            {globalTone.videoCta}
          </Link>
        </div>
      </section>

      <section className="mt-5 rounded-2xl border border-[#E5E7EB] bg-white p-5">
        <h2 className="text-lg font-semibold">Volumes par memorial</h2>
        <div className="mt-4 space-y-3">
          {data.memorials.map((m) => (
            <div key={m.id} className="rounded-xl border border-[#EEF2F7] p-4">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-medium">{m.title}</p>
                <span className="rounded-full bg-[#F5F0E8] px-2 py-1 text-[11px] text-[#7A4C15]">
                  {m.accessRole === 'editor'
                    ? 'Co-editeur'
                    : m.accessRole === 'contributor'
                    ? 'Contributeur'
                    : m.accessRole === 'viewer'
                    ? 'Lecture seule'
                    : 'Proprietaire'}
                </span>
              </div>
              <p className="mt-1 text-xs text-[#6B7280]">{getCommunTypeConfig((m.communType || 'deces') as CommunType).title}</p>
              <p className="mt-1 text-xs text-[#6B7280]">{m.photosCount} photos • {m.messagesCount} messages • {m.candlesCount} bougies</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-5 rounded-2xl border border-[#E5E7EB] bg-white p-5">
        <h2 className="text-lg font-semibold">Module video (phase 2)</h2>
        <p className="mt-1 text-sm text-[#6B7280]">
          30 photos incluses. Generation asynchrone MP4. Usage famille uniquement.
        </p>
        <p className="mt-1 text-xs text-[#6B7280]">
          Contexte actif: {selectedMemory ? selectedTone.title : 'Selectionnez un memorial modifiable'}
        </p>
        <p className="mt-1 text-xs text-[#6B7280]">
          Seuls les espaces dont vous etes proprietaire ou co-editeur peuvent lancer une generation video.
        </p>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <label className="text-sm">
            <span className="mb-1 block text-[#374151]">Memorial</span>
            <select
              value={selectedMemoryId}
              onChange={(e) => setSelectedMemoryId(e.target.value)}
              className="w-full rounded-lg border px-3 py-2 text-sm"
            >
              <option value="">Selectionner</option>
              {memoryOptions.map((m) => (
                <option key={m.id} value={m.id}>{m.title}</option>
              ))}
            </select>
          </label>

          <label className="text-sm">
            <span className="mb-1 block text-[#374151]">Template</span>
            <select
              value={templateId}
              onChange={(e) => setTemplateId(e.target.value as VideoTemplateId)}
              className="w-full rounded-lg border px-3 py-2 text-sm"
            >
              {Object.values(VIDEO_TEMPLATES).map((tpl) => (
                <option key={tpl.id} value={tpl.id}>{tpl.label}</option>
              ))}
            </select>
          </label>

          <label className="text-sm">
            <span className="mb-1 block text-[#374151]">Musique</span>
            <select
              value={musicId}
              onChange={(e) => setMusicId(e.target.value)}
              className="w-full rounded-lg border px-3 py-2 text-sm"
            >
              <option value="piano-doux">Piano doux</option>
              <option value="guitare-acoustique">Guitare acoustique</option>
              <option value="minimal-instrumental">Instrumental minimal</option>
            </select>
          </label>

          <label className="text-sm">
            <span className="mb-1 block text-[#374151]">Cartons texte (optionnel)</span>
            <input
              value={snippetsRaw}
              onChange={(e) => setSnippetsRaw(e.target.value)}
              placeholder="Ses passions | Ses rires | Ses lieux"
              className="w-full rounded-lg border px-3 py-2 text-sm"
            />
          </label>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button
            disabled={!selectedMemoryId || isSubmitting}
            onClick={async () => {
              setVideoError('');
              setDownloadUrl('');
              setIsSubmitting(true);
              try {
                const { data: session } = await supabase.auth.getSession();
                const token = session.session?.access_token;
                if (!token) throw new Error('Session manquante');

                const photosRes = await fetch(`/api/videos/photos?memory_id=${encodeURIComponent(selectedMemoryId)}`, {
                  headers: { Authorization: `Bearer ${token}` },
                });
                const photosPayload = await photosRes.json();
                if (!photosRes.ok) throw new Error(photosPayload?.error || 'Photos indisponibles');

                const snippets = snippetsRaw
                  .split('|')
                  .map((s) => s.trim())
                  .filter(Boolean)
                  .slice(0, 8);

                const createRes = await fetch('/api/videos', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                  },
                  body: JSON.stringify({
                    memory_id: selectedMemoryId,
                    template_id: templateId,
                    music_id: musicId,
                    photo_ids: (photosPayload.photo_ids || []).slice(0, 30),
                    text_snippets: snippets,
                  }),
                });

                const createPayload = await createRes.json();
                if (!createRes.ok) throw new Error(createPayload?.error || 'Creation video impossible');

                const id = createPayload?.video?.id;
                setVideoJobId(id || '');
                setVideoStatus(createPayload?.video?.status || 'queued');
                setVideoProgress(Number(createPayload?.video?.progress || 0));
              } catch (e: any) {
                setVideoError(e?.message || 'Erreur creation video');
              } finally {
                setIsSubmitting(false);
              }
            }}
            className="rounded-lg bg-[#1B2D3E] px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {isSubmitting ? 'Creation...' : 'Generer la video'}
          </button>

          <button
            disabled={!videoJobId}
            onClick={async () => {
              setVideoError('');
              setDownloadUrl('');
              try {
                const { data: session } = await supabase.auth.getSession();
                const token = session.session?.access_token;
                if (!token) throw new Error('Session manquante');

                const res = await fetch(`/api/videos/${videoJobId}`, {
                  headers: { Authorization: `Bearer ${token}` },
                });
                const payload = await res.json();
                if (!res.ok) throw new Error(payload?.error || 'Statut indisponible');
                setVideoStatus(payload.status || '');
                setVideoProgress(Number(payload.progress || 0));
                if (payload.download_url) setDownloadUrl(payload.download_url);
              } catch (e: any) {
                setVideoError(e?.message || 'Erreur statut video');
              }
            }}
            className="rounded-lg border px-4 py-2 text-sm disabled:opacity-50"
          >
            Rafraichir statut
          </button>
        </div>

        {videoJobId ? (
          <div className="mt-4 rounded-lg border border-[#E5E7EB] bg-[#FAFAFA] p-3 text-sm">
            <p>Job: <span className="font-mono">{videoJobId}</span></p>
            <p>Statut: <strong>{videoStatus || 'queued'}</strong></p>
            <p>Progression: {videoProgress}%</p>
            {downloadUrl ? (
              <a href={downloadUrl} target="_blank" rel="noreferrer" className="mt-2 inline-block text-[#0B66C3] underline">
                Telecharger MP4
              </a>
            ) : null}
          </div>
        ) : null}

        {videoError ? <p className="mt-3 text-sm text-red-600">{videoError}</p> : null}
      </section>
    </UserDashboardShell>
  );
}
