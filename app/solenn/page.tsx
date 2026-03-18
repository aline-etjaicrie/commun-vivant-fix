'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

interface SolennDraft {
  id: string;
  createdAt: string;
  updatedAt?: string;
  duration: '5' | '10' | '15';
  context: 'Crémation' | 'Inhumation' | 'Cérémonie intime';
  tone: 'Sobre' | 'Narratif' | 'Chaleureux';
  blocks: Record<string, string>;
  text: string;
  regenerationCount: number;
}

interface SolennApiDocument {
  id: string;
  title: string | null;
  duration_minutes: number;
  ceremony_context: string;
  tone: string;
  blocks: Record<string, string>;
  content: string;
  regeneration_count: number;
  created_at: string;
  updated_at: string;
}

const STORAGE_KEY = 'solenn_history_v1';
const supabase = createClient();

const defaultBlocks: Record<string, string> = {
  identite: '',
  caractere: '',
  passions: '',
  lieux: '',
  sensibilite: '',
  humour: '',
  proches: '',
  messageFinal: '',
};

function loadLocalHistory(): SolennDraft[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveLocalHistory(items: SolennDraft[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function blockLabel(key: string): string {
  const labels: Record<string, string> = {
    identite: 'Identité',
    caractere: 'Caractère',
    passions: 'Passions',
    lieux: 'Lieux',
    sensibilite: 'Sensibilité',
    humour: 'Humour (optionnel)',
    proches: 'Proches',
    messageFinal: 'Message final',
  };
  return labels[key] || key;
}

function fromApiDocument(doc: SolennApiDocument): SolennDraft {
  const duration = String(doc.duration_minutes) as '5' | '10' | '15';
  return {
    id: doc.id,
    createdAt: doc.created_at,
    updatedAt: doc.updated_at,
    duration,
    context: (doc.ceremony_context as SolennDraft['context']) || 'Crémation',
    tone: (doc.tone as SolennDraft['tone']) || 'Narratif',
    blocks: doc.blocks || { ...defaultBlocks },
    text: doc.content || '',
    regenerationCount: doc.regeneration_count || 0,
  };
}

export default function SolennPage() {
  const [screen, setScreen] = useState<1 | 2 | 3 | 4>(1);
  const [duration, setDuration] = useState<'5' | '10' | '15'>('10');
  const [context, setContext] = useState<'Crémation' | 'Inhumation' | 'Cérémonie intime'>('Crémation');
  const [tone, setTone] = useState<'Sobre' | 'Narratif' | 'Chaleureux'>('Narratif');
  const [blocks, setBlocks] = useState<Record<string, string>>({ ...defaultBlocks });
  const [validatedThemesInput, setValidatedThemesInput] = useState('');
  const [text, setText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEditing, setIsEditing] = useState(true);
  const [regenCount, setRegenCount] = useState(0);
  const [history, setHistory] = useState<SolennDraft[]>(() => loadLocalHistory());
  const [activeDraftId, setActiveDraftId] = useState<string | null>(null);
  const [isCloudEnabled, setIsCloudEnabled] = useState(false);

  const isFormComplete = useMemo(() => {
    return blocks.identite.trim().length > 0 && blocks.caractere.trim().length > 0 && blocks.proches.trim().length > 0;
  }, [blocks]);

  const getAuthHeaders = useCallback(async (): Promise<Record<string, string>> => {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) return {};
    return { Authorization: `Bearer ${token}` };
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('image_themes') || localStorage.getItem('memory_image_energies');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setValidatedThemesInput(parsed.slice(0, 12).join(', '));
          }
        } catch {
          // no-op
        }
      }
    }
  }, []);

  useEffect(() => {
    const loadRemoteHistory = async () => {
      try {
        const headers = await getAuthHeaders();
        if (!headers.Authorization) {
          setIsCloudEnabled(false);
          return;
        }

        const res = await fetch('/api/solenn/documents', { headers });
        if (!res.ok) {
          setIsCloudEnabled(false);
          return;
        }

        const data = await res.json();
        const remoteHistory = (data.documents || []).map(fromApiDocument);
        if (remoteHistory.length > 0) {
          setHistory(remoteHistory);
          saveLocalHistory(remoteHistory);
        }
        setIsCloudEnabled(true);
      } catch {
        setIsCloudEnabled(false);
      }
    };

    void loadRemoteHistory();
  }, [getAuthHeaders]);

  const saveDraftToCloud = async (draft: SolennDraft): Promise<SolennDraft | null> => {
    try {
      const headers = await getAuthHeaders();
      if (!headers.Authorization) return null;

      const response = await fetch('/api/solenn/documents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        body: JSON.stringify({
          id: draft.id.startsWith('solenn-') || draft.id.startsWith('dup-') ? undefined : draft.id,
          title: draft.blocks.identite,
          duration: draft.duration,
          context: draft.context,
          tone: draft.tone,
          blocks: draft.blocks,
          text: draft.text,
          regenerationCount: draft.regenerationCount,
        }),
      });

      if (!response.ok) return null;
      const payload = await response.json();
      if (!payload?.document) return null;
      return fromApiDocument(payload.document);
    } catch {
      return null;
    }
  };

  const generateText = async (isRegeneration = false) => {
    if (isRegeneration && regenCount >= 2) return;
    setIsGenerating(true);

    try {
      const response = await fetch('/api/solenn/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          duration,
          context,
          tone,
          blocks,
          validatedThemes: validatedThemesInput
            .split(',')
            .map((v) => v.trim())
            .filter(Boolean)
            .slice(0, 12),
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || 'Erreur de génération');
      }

      setText(data.text);
      setIsEditing(true);
      setScreen(3);
      if (isRegeneration) {
        setRegenCount((c) => c + 1);
      }
    } catch (error: any) {
      alert(error?.message || 'Impossible de générer le texte');
    } finally {
      setIsGenerating(false);
    }
  };

  const persistCurrentDraft = async () => {
    const baseDraft: SolennDraft = {
      id: activeDraftId || `solenn-${Date.now()}`,
      createdAt: new Date().toISOString(),
      duration,
      context,
      tone,
      blocks,
      text,
      regenerationCount: regenCount,
    };

    const cloudDraft = await saveDraftToCloud(baseDraft);
    const draft = cloudDraft || baseDraft;

    const withoutCurrent = history.filter((h) => h.id !== draft.id);
    const next = [draft, ...withoutCurrent].slice(0, 200);
    setHistory(next);
    saveLocalHistory(next);
    setActiveDraftId(draft.id);

    if (cloudDraft) {
      setIsCloudEnabled(true);
    }
  };

  const exportPdf = async (draft?: SolennDraft) => {
    const source = draft || {
      id: activeDraftId || 'solenn-current',
      createdAt: new Date().toISOString(),
      duration,
      context,
      tone,
      blocks,
      text,
      regenerationCount: regenCount,
    };

    try {
      const response = await fetch('/api/solenn/export-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: source.blocks.identite,
          duration: source.duration,
          context: source.context,
          tone: source.tone,
          text: source.text,
        }),
      });

      if (!response.ok) {
        throw new Error('Export PDF impossible');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `solenn-${source.id}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert('Export PDF indisponible pour le moment');
    }
  };

  const copyText = async () => {
    try {
      await navigator.clipboard.writeText(text);
      alert('Texte copié');
    } catch {
      alert('Copie impossible');
    }
  };

  const loadDraft = (draft: SolennDraft) => {
    setDuration(draft.duration);
    setContext(draft.context);
    setTone(draft.tone);
    setBlocks(draft.blocks);
    setText(draft.text);
    setRegenCount(draft.regenerationCount || 0);
    setActiveDraftId(draft.id);
    setScreen(3);
  };

  return (
    <main className="min-h-screen bg-white text-[#1F2B35]">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[#5F7487]">Module Pro</p>
            <h1 className="text-3xl font-semibold">SOLENN</h1>
            <p className="text-sm text-[#5E6B78]">Rédaction de cérémonies civiles pour pompes funèbres</p>
            <p className="mt-1 text-xs text-[#5E6B78]">
              Historique: {isCloudEnabled ? 'Cloud Supabase actif' : 'Mode local (connexion requise pour synchroniser)'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setScreen(1)} className="rounded-lg border px-3 py-2 text-sm">Nouvelle rédaction</button>
            <button onClick={() => setScreen(4)} className="rounded-lg border px-3 py-2 text-sm">Historique</button>
            <Link href="/create?communType=pro-ceremonie&context=funeral" className="rounded-lg bg-[#1F2B35] px-3 py-2 text-sm text-white">Retour parcours</Link>
          </div>
        </header>

        {screen === 1 && (
          <section className="rounded-2xl border bg-white p-8 shadow-sm">
            <h2 className="mb-6 text-2xl font-medium">Nouvelle cérémonie civile</h2>
            <div className="grid gap-6 md:grid-cols-3">
              <div>
                <p className="mb-2 text-sm font-medium">Durée</p>
                <div className="space-y-2">
                  {(['5', '10', '15'] as const).map((d) => (
                    <label key={d} className="flex items-center gap-2 text-sm">
                      <input type="radio" checked={duration === d} onChange={() => setDuration(d)} />
                      {d} minutes
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-2 text-sm font-medium">Contexte</p>
                <div className="space-y-2">
                  {(['Crémation', 'Inhumation', 'Cérémonie intime'] as const).map((c) => (
                    <label key={c} className="flex items-center gap-2 text-sm">
                      <input type="radio" checked={context === c} onChange={() => setContext(c)} />
                      {c}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-2 text-sm font-medium">Tonalité</p>
                <div className="space-y-2">
                  {(['Sobre', 'Narratif', 'Chaleureux'] as const).map((t) => (
                    <label key={t} className="flex items-center gap-2 text-sm">
                      <input type="radio" checked={tone === t} onChange={() => setTone(t)} />
                      {t}
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <button
              onClick={() => setScreen(2)}
              className="mt-8 rounded-lg bg-[#1F2B35] px-5 py-3 text-sm font-medium text-white"
            >
              Commencer
            </button>
          </section>
        )}

        {screen === 2 && (
          <section className="rounded-2xl border bg-white p-8 shadow-sm">
            <h2 className="mb-6 text-2xl font-medium">Formulaire structuré</h2>

            <div className="mb-6 rounded-xl border border-[#E5E7EB] bg-[#FAFAFA] p-4">
              <label className="mb-2 block text-sm font-medium">Themes dominants valides (optionnel)</label>
              <input
                value={validatedThemesInput}
                onChange={(e) => setValidatedThemesInput(e.target.value)}
                placeholder="Famille, Voyage, Nature, Amitie"
                className="w-full rounded-lg border px-3 py-2 text-sm"
              />
              <p className="mt-1 text-xs text-[#5E6B78]">Mots separes par virgules.</p>
            </div>
            <div className="space-y-4">
              {Object.keys(defaultBlocks).map((key) => (
                <details key={key} className="rounded-xl border p-4" open={key === 'identite'}>
                  <summary className="cursor-pointer text-sm font-semibold">{blockLabel(key)}</summary>
                  <textarea
                    value={blocks[key] || ''}
                    onChange={(e) => setBlocks((prev) => ({ ...prev, [key]: e.target.value }))}
                    className="mt-3 min-h-28 w-full rounded-lg border p-3 text-sm"
                    placeholder={`Renseigner: ${blockLabel(key)}`}
                  />
                </details>
              ))}
            </div>
            <div className="mt-6 flex items-center gap-3">
              <button onClick={() => setScreen(1)} className="rounded-lg border px-4 py-2 text-sm">Retour</button>
              <button
                disabled={!isFormComplete || isGenerating}
                onClick={() => generateText(false)}
                className="rounded-lg bg-[#1F2B35] px-5 py-2 text-sm font-medium text-white disabled:opacity-40"
              >
                {isGenerating ? 'Génération...' : 'Générer le texte'}
              </button>
            </div>
          </section>
        )}

        {screen === 3 && (
          <section className="rounded-2xl border bg-white p-8 shadow-sm">
            <h2 className="mb-4 text-2xl font-medium">Résultat</h2>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              disabled={!isEditing}
              className="min-h-[420px] w-full rounded-xl border p-4 text-sm leading-relaxed disabled:bg-[#F8FAFC]"
            />
            <div className="mt-6 grid gap-2 md:grid-cols-3 lg:grid-cols-6">
              <button onClick={() => setIsEditing((v) => !v)} className="rounded-lg border px-3 py-2 text-sm">Modifier</button>
              <button
                disabled={regenCount >= 2 || isGenerating}
                onClick={() => generateText(true)}
                className="rounded-lg border px-3 py-2 text-sm disabled:opacity-40"
              >
                Régénérer ({Math.max(0, 2 - regenCount)} restant)
              </button>
              <button onClick={() => exportPdf()} className="rounded-lg border px-3 py-2 text-sm">Export PDF</button>
              <button onClick={copyText} className="rounded-lg border px-3 py-2 text-sm">Copier</button>
              <button
                onClick={async () => {
                  await persistCurrentDraft();
                  setScreen(4);
                }}
                className="rounded-lg border px-3 py-2 text-sm"
              >
                Historiser
              </button>
              <Link href="/create?communType=deces&context=funeral" className="rounded-lg bg-[#1F2B35] px-3 py-2 text-center text-sm text-white">
                Ajouter mémorial numérique
              </Link>
            </div>
          </section>
        )}

        {screen === 4 && (
          <section className="rounded-2xl border bg-white p-8 shadow-sm">
            <h2 className="mb-6 text-2xl font-medium">Historique</h2>
            {history.length === 0 ? (
              <p className="text-sm text-[#5E6B78]">Aucune cérémonie enregistrée.</p>
            ) : (
              <div className="space-y-3">
                {history.map((item) => (
                  <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4">
                    <div>
                      <p className="font-medium">{item.blocks.identite || 'Sans nom'}</p>
                      <p className="text-xs text-[#5E6B78]">
                        {new Date(item.createdAt).toLocaleDateString()} • {item.duration} min • {item.context}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => exportPdf(item)} className="rounded-lg border px-3 py-2 text-xs">Téléchargement</button>
                      <button onClick={() => loadDraft({ ...item, id: `dup-${Date.now()}` })} className="rounded-lg border px-3 py-2 text-xs">Dupliquer</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  );
}
