'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { AlertCircle, Check, Clock3, Edit2, RotateCw, Save } from 'lucide-react';

const supabase = createClient();

type TextVersion = {
  id: string;
  versionKind: string;
  source: string;
  style: string | null;
  actorEmail: string | null;
  actorRole: string | null;
  excerpt: string;
  createdAt: string;
  metadata: Record<string, unknown>;
};

type MemoryTextPayload = {
  memory: {
    id: string;
    title: string;
    bio: string;
    style: string;
    generatedTextOriginal: string;
    generatedTextEdited: string;
    textManuallyEdited: boolean;
    regenerationCount: number;
    regenerationLimit: number;
  };
  access: {
    role: string;
    canEdit: boolean;
  };
  versions: TextVersion[];
};

export default function TextEditorPage() {
  const params = useParams();
  const memoryId = String(params?.id || '');
  const router = useRouter();

  const [mode, setMode] = useState<'view' | 'edit' | 'regenerate'>('view');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [memory, setMemory] = useState<MemoryTextPayload['memory'] | null>(null);
  const [versions, setVersions] = useState<TextVersion[]>([]);
  const [canEdit, setCanEdit] = useState(false);
  const [currentStyle, setCurrentStyle] = useState('narratif');
  const [selectedRegenStyle, setSelectedRegenStyle] = useState('narratif');
  const [notice, setNotice] = useState<{ type: 'error' | 'info' | 'success'; message: string } | null>(null);

  const editor = useEditor({
    extensions: [StarterKit],
    content: '',
  });

  const getAccessToken = async () => {
    const session = await supabase.auth.getSession();
    return session.data.session?.access_token || null;
  };

  const fetchMemory = useCallback(async () => {
    try {
      setLoading(true);
      setNotice(null);

      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) {
        router.push(`/login?returnUrl=${encodeURIComponent(`/dashboard/${memoryId}/text`)}`);
        return;
      }

      const accessToken = await getAccessToken();
      if (!accessToken) {
        router.push(`/login?returnUrl=${encodeURIComponent(`/dashboard/${memoryId}/text`)}`);
        return;
      }

      const response = await fetch(`/api/user-dashboard/memorials/${encodeURIComponent(memoryId)}/text`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(payload?.error || 'Chargement du texte impossible');
      }

      setMemory(payload.memory);
      setVersions(payload.versions || []);
      setCanEdit(Boolean(payload.access?.canEdit));
      setCurrentStyle(payload.memory?.style || 'narratif');
      setSelectedRegenStyle(payload.memory?.style || 'narratif');
    } catch (error: any) {
      console.error('Text page load error:', error);
      setNotice({
        type: 'error',
        message: error?.message || 'Le texte ne peut pas encore être chargé.',
      });
    } finally {
      setLoading(false);
    }
  }, [memoryId, router]);

  useEffect(() => {
    if (memoryId) void fetchMemory();
  }, [memoryId, fetchMemory]);

  useEffect(() => {
    if (!editor || !memory) return;

    const content = memory.generatedTextEdited || memory.generatedTextOriginal || memory.bio || '';
    if (content && editor.getText().trim().length === 0) {
      editor.commands.setContent(content);
    }
  }, [memory, editor]);

  const handleSaveEdit = async () => {
    if (!editor || !memory) return;

    try {
      setSaving(true);
      setNotice(null);

      const accessToken = await getAccessToken();
      if (!accessToken) {
        router.push(`/login?returnUrl=${encodeURIComponent(`/dashboard/${memoryId}/text`)}`);
        return;
      }

      const textHtml = editor.getHTML();
      const textPlain = editor.getText();

      const response = await fetch(`/api/user-dashboard/memorials/${encodeURIComponent(memoryId)}/text`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          textHtml,
          textPlain,
          style: currentStyle,
        }),
      });

      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(payload?.error || 'Enregistrement impossible');
      }

      setMemory((prev) =>
        prev
          ? {
              ...prev,
              generatedTextEdited: textHtml,
              bio: textPlain,
              textManuallyEdited: true,
            }
          : prev
      );
      setVersions(payload?.versions || []);
      setMode('view');
      setNotice({
        type: 'success',
        message: 'Cette version du texte a bien été enregistrée.',
      });
    } catch (error: any) {
      console.error('Text save error:', error);
      setNotice({
        type: 'error',
        message: error?.message || "Le texte n'a pas pu être enregistré.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleRegenerate = async () => {
    if (!memory) return;

    try {
      setGenerating(true);
      setNotice(null);

      const accessToken = await getAccessToken();
      if (!accessToken) {
        router.push(`/login?returnUrl=${encodeURIComponent(`/dashboard/${memoryId}/text`)}`);
        return;
      }

      const response = await fetch('/api/regenerate-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          memory_id: memoryId,
          new_style: selectedRegenStyle,
        }),
      });

      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(payload?.error || 'Regeneration impossible');
      }

      if (editor) {
        editor.commands.setContent(payload?.generated_text || '');
      }
      await fetchMemory();
      setMode('view');
      setNotice({
        type: 'success',
        message: payload?.contributionCount
          ? `Une nouvelle version a été générée en tenant compte de ${payload.contributionCount} souvenir(s) partagé(s).`
          : 'Une nouvelle version du texte a été générée.',
      });
    } catch (error: any) {
      console.error('Regenerate error:', error);
      setNotice({
        type: 'error',
        message: error?.message || 'La régénération n’a pas pu aboutir.',
      });
    } finally {
      setGenerating(false);
    }
  };

  const styles = [
    { id: 'sobre', name: 'Sobre et factuel', desc: 'Ton direct, sans fioritures.' },
    { id: 'narratif', name: 'Narratif et chaleureux', desc: 'Ton fluide et humain.' },
    { id: 'poetique', name: 'Poétique et sensible', desc: 'Ton plus littéraire, sans emphase.' },
  ];

  const currentText = memory?.generatedTextEdited || memory?.generatedTextOriginal || memory?.bio || '';

  const formatVersionLabel = (version: TextVersion) => {
    if (version.versionKind === 'manual_edit') return 'Modification manuelle';
    if (version.versionKind === 'regenerated') return 'Régénération';
    if (version.versionKind === 'generated_full') return 'Première génération complète';
    if (version.versionKind === 'generated') return 'Première génération';
    return 'Version enregistrée';
  };

  if (loading) {
    return <div className="p-8 text-center text-stone-400">Chargement du texte...</div>;
  }

  if (!memory) {
    return (
      <div className="mx-auto max-w-3xl p-8">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
          Le texte ne peut pas être chargé pour le moment.
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-8 bg-white min-h-screen">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-serif text-[#1A1A2E]">{memory.title || 'Votre récit généré'}</h1>
          <p className="mt-2 text-sm text-stone-500">
            Relisez, ajustez et gardez une trace des différentes versions du texte.
          </p>
        </div>
        <div className="rounded-full bg-stone-50 px-4 py-2 text-xs uppercase tracking-[0.2em] text-stone-500">
          {canEdit ? 'Edition autorisee' : 'Lecture seule'}
        </div>
      </div>

      {notice && (
        <div
          className={`mb-6 rounded-2xl border p-4 text-sm ${
            notice.type === 'error'
              ? 'border-red-200 bg-red-50 text-red-700'
              : notice.type === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
              : 'border-amber-200 bg-amber-50 text-amber-700'
          }`}
        >
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <p>{notice.message}</p>
          </div>
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-[1.45fr_0.85fr]">
        <div>
          {mode === 'view' && (
            <div className="animate-in fade-in">
              <div className="bg-stone-50 p-4 rounded mb-8 text-sm text-stone-500">
                Style utilisé :{' '}
                <span className="font-bold text-[#1A1A2E] uppercase">
                  {styles.find((item) => item.id === currentStyle)?.name || currentStyle}
                </span>
              </div>

              <div className="prose prose-lg text-stone-700 leading-relaxed mb-12 bg-white p-6 border border-stone-100 shadow-sm rounded-xl min-h-[360px]">
                {currentText ? <div dangerouslySetInnerHTML={{ __html: currentText }} /> : <p>Aucun texte disponible pour le moment.</p>}
              </div>

              <div className="grid md:grid-cols-3 gap-4 border-t border-stone-100 pt-8">
                {canEdit ? (
                  <>
                    <button
                      onClick={() => setMode('edit')}
                      className="flex items-center justify-center gap-2 py-4 border border-stone-200 rounded-lg hover:border-[#D4AF37] hover:text-[#D4AF37] transition-all font-bold text-sm uppercase tracking-wide"
                    >
                      <Edit2 className="w-4 h-4" /> Modifier
                    </button>
                    <button
                      onClick={() => setMode('regenerate')}
                      className="flex items-center justify-center gap-2 py-4 border border-stone-200 rounded-lg hover:border-[#D4AF37] hover:text-[#D4AF37] transition-all font-bold text-sm uppercase tracking-wide"
                    >
                      <RotateCw className="w-4 h-4" /> Regénérer
                    </button>
                  </>
                ) : (
                  <div className="md:col-span-2 rounded-lg border border-stone-200 bg-stone-50 px-4 py-4 text-sm text-stone-500">
                    Vous pouvez consulter le texte, mais seules les personnes en rôle propriétaire ou co-éditeur peuvent le modifier.
                  </div>
                )}
                <button
                  onClick={() => router.push(`/dashboard/${memoryId}`)}
                  className="flex items-center justify-center gap-2 py-4 bg-[#1A1A2E] text-white rounded-lg hover:shadow-lg transition-all font-bold text-sm uppercase tracking-wide"
                >
                  <Check className="w-4 h-4" /> Retour au tableau de bord
                </button>
              </div>
            </div>
          )}

          {mode === 'edit' && canEdit && (
            <div className="animate-in fade-in">
              <div className="bg-blue-50 text-blue-800 p-4 rounded mb-6 text-sm">
                Modifiez le texte librement, puis enregistrez cette nouvelle version.
              </div>

              <div className="border border-stone-300 rounded-xl overflow-hidden mb-8 min-h-[400px]">
                {editor && <EditorContent editor={editor} className="prose prose-lg max-w-none p-6 outline-none" />}
              </div>

              <div className="flex justify-end gap-4">
                <button onClick={() => setMode('view')} className="px-6 py-3 text-stone-500 hover:text-stone-800">
                  Annuler
                </button>
                <button
                  onClick={handleSaveEdit}
                  disabled={saving}
                  className="px-8 py-3 bg-[#1A1A2E] text-white rounded-full font-bold shadow-lg flex items-center gap-2 disabled:opacity-60"
                >
                  {saving ? <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" /> : <Save className="w-4 h-4" />}
                  Enregistrer
                </button>
              </div>
            </div>
          )}

          {mode === 'regenerate' && canEdit && (
            <div className="animate-in fade-in">
              <div className="bg-orange-50 text-orange-800 p-4 rounded mb-8 text-sm flex items-center gap-2">
                Attention : regénérer remplacera le texte actuel affiché. Il reste {Math.max((memory.regenerationLimit || 3) - (memory.regenerationCount || 0), 0)} essai(s).
              </div>

              <div className="space-y-4 mb-12">
                {styles.map((style) => (
                  <div
                    key={style.id}
                    onClick={() => setSelectedRegenStyle(style.id)}
                    className={`p-6 rounded-xl border-2 cursor-pointer transition-all ${
                      selectedRegenStyle === style.id ? 'border-[#D4AF37] bg-[#D4AF37]/5' : 'border-stone-100 hover:border-stone-200'
                    }`}
                  >
                    <h3 className="font-bold text-[#1A1A2E] mb-1">{style.name}</h3>
                    <p className="text-sm text-stone-500">{style.desc}</p>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-4">
                <button onClick={() => setMode('view')} className="px-6 py-3 text-stone-500 hover:text-stone-800">
                  Annuler
                </button>
                <button
                  onClick={handleRegenerate}
                  disabled={generating}
                  className="px-8 py-3 bg-[#D4AF37] text-white rounded-full font-bold shadow-lg flex items-center gap-2 hover:bg-[#C49F27] disabled:opacity-60"
                >
                  {generating ? <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" /> : <RotateCw className="w-4 h-4" />}
                  Confirmer la régénération
                </button>
              </div>
            </div>
          )}
        </div>

        <aside className="space-y-6">
          <div className="rounded-2xl border border-stone-200 bg-stone-50 p-5">
            <h2 className="text-lg font-semibold text-[#1A1A2E]">Versions récentes</h2>
            <p className="mt-2 text-sm text-stone-500">
              Chaque génération ou modification importante peut laisser une trace pour sécuriser le travail collectif.
            </p>
          </div>

          <div className="space-y-4">
            {versions.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-stone-200 p-5 text-sm text-stone-500">
                Aucune version historisée n’est encore disponible.
              </div>
            ) : (
              versions.map((version) => (
                <div key={version.id} className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-[#1A1A2E]">{formatVersionLabel(version)}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.16em] text-stone-400">
                        {version.style || 'style non precise'}
                      </p>
                    </div>
                    <div className="inline-flex items-center gap-1 rounded-full bg-stone-50 px-3 py-1 text-xs text-stone-500">
                      <Clock3 className="h-3.5 w-3.5" />
                      {new Date(version.createdAt).toLocaleDateString('fr-FR')}
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-stone-600">
                    {version.excerpt || 'Version enregistrée sans extrait lisible.'}
                  </p>
                  {(version.actorEmail || version.actorRole) && (
                    <p className="mt-3 text-xs text-stone-400">
                      {version.actorEmail || 'Quelqu’un'} {version.actorRole ? `• ${version.actorRole}` : ''}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
