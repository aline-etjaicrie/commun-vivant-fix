'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Loader2, Send, CheckCircle2 } from 'lucide-react';

const MIN_CONTENT_WORDS = 10;

function wordCount(text: string): number {
  return text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
}

type PageState =
  | { phase: 'loading' }
  | { phase: 'invalid'; reason: string }
  | { phase: 'expired' }
  | { phase: 'form'; memoryTitle: string }
  | { phase: 'success' }
  | { phase: 'error' };

export default function InvitePage() {
  const params = useParams();
  const token = String(params?.token || '');

  const [state, setState] = useState<PageState>({ phase: 'loading' });
  const [authorName, setAuthorName] = useState('');
  const [relationship, setRelationship] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    if (!token) {
      setState({ phase: 'invalid', reason: 'Lien invalide.' });
      return;
    }
    fetch(`/api/memory-invites/${token}`)
      .then(async (res) => {
        if (res.status === 404) {
          setState({ phase: 'invalid', reason: "Ce lien n'existe pas." });
          return;
        }
        if (!res.ok) {
          setState({ phase: 'error' });
          return;
        }
        const data = await res.json();
        const invite = data?.invite;
        const memory = data?.memory;
        if (!invite) {
          setState({ phase: 'invalid', reason: 'Invitation introuvable.' });
          return;
        }
        if (invite.status === 'expired' || invite.status === 'revoked') {
          setState({ phase: 'expired' });
          return;
        }
        setState({
          phase: 'form',
          memoryTitle: memory?.title || 'cet espace mémoire',
        });
      })
      .catch(() => setState({ phase: 'error' }));
  }, [token]);

  const words = wordCount(content);
  const canSubmit = words >= MIN_CONTENT_WORDS && !submitting;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setSubmitError('');

    try {
      const res = await fetch(`/api/memory-invites/${token}/guest-contribute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ authorName, relationship, content }),
      });

      if (res.status === 410) {
        setState({ phase: 'expired' });
        return;
      }
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setSubmitError(data?.error || 'Une erreur est survenue. Réessayez dans un instant.');
        return;
      }

      setState({ phase: 'success' });
    } catch {
      setSubmitError('Impossible d'envoyer pour le moment. Vérifiez votre connexion.');
    } finally {
      setSubmitting(false);
    }
  };

  // — États non-formulaire —

  if (state.phase === 'loading') {
    return (
      <div className="min-h-screen bg-[#0F2A44] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-[#C9A24D] animate-spin mx-auto mb-4" />
          <p className="text-[#C9A24D]">Chargement de l'invitation…</p>
        </div>
      </div>
    );
  }

  if (state.phase === 'expired') {
    return (
      <div className="min-h-screen bg-[#0F2A44] flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center">
          <p className="text-3xl mb-4">⏳</p>
          <h1 className="text-xl font-semibold text-[#0F2A44] mb-3">Invitation expirée</h1>
          <p className="text-gray-600 mb-6 text-sm">
            Ce lien n'est plus valide. Demandez à la personne qui vous a invité un nouveau lien.
          </p>
          <Link href="/" className="inline-block px-6 py-3 bg-[#C9A24D] text-[#0F2A44] rounded-lg text-sm font-semibold hover:bg-[#E1C97A] transition-colors">
            Retour à l'accueil
          </Link>
        </div>
      </div>
    );
  }

  if (state.phase === 'invalid' || state.phase === 'error') {
    return (
      <div className="min-h-screen bg-[#0F2A44] flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center">
          <p className="text-3xl mb-4">❌</p>
          <h1 className="text-xl font-semibold text-[#0F2A44] mb-3">Lien invalide</h1>
          <p className="text-gray-600 mb-6 text-sm">
            {state.phase === 'invalid' ? state.reason : 'Une erreur est survenue. Réessayez dans quelques instants.'}
          </p>
          <Link href="/" className="inline-block px-6 py-3 bg-[#C9A24D] text-[#0F2A44] rounded-lg text-sm font-semibold hover:bg-[#E1C97A] transition-colors">
            Retour à l'accueil
          </Link>
        </div>
      </div>
    );
  }

  if (state.phase === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0F2A44] to-[#1C3B5A] flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl p-10 max-w-md w-full text-center shadow-2xl">
          <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
          <h1 className="text-2xl font-semibold text-[#0F2A44] mb-3">Souvenir transmis</h1>
          <p className="text-gray-600 text-sm leading-relaxed mb-6">
            Merci pour ce témoignage. La personne qui compose cet espace le recevra et pourra l'intégrer.
          </p>
          <Link href="/" className="inline-block px-6 py-3 bg-[#C9A24D] text-[#0F2A44] rounded-lg text-sm font-semibold hover:bg-[#E1C97A] transition-colors">
            Retour à l'accueil
          </Link>
        </div>
      </div>
    );
  }

  // — Formulaire principal —

  const { memoryTitle } = state;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0F2A44] to-[#1C3B5A] flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl p-8 md:p-12 max-w-xl w-full shadow-2xl">

        {/* En-tête */}
        <div className="text-center mb-8">
          <Image src="/logo.png" alt="Commun Vivant" width={64} height={64} className="w-16 h-16 rounded-full mx-auto mb-4" />
          <p className="text-sm uppercase tracking-widest text-[#C9A24D] mb-2">Vous avez été invité</p>
          <h1
            className="text-3xl text-[#0F2A44] leading-snug"
            style={{ fontFamily: 'var(--font-calli), Georgia, serif', fontStyle: 'italic' }}
          >
            {memoryTitle}
          </h1>
          <p className="mt-3 text-sm text-gray-500 leading-relaxed">
            Partagez un souvenir, une anecdote, ce qui rend cette personne unique à vos yeux.
            Votre contribution sera relue par la personne qui compose cet espace.
          </p>
        </div>

        {/* Champs */}
        <div className="space-y-5">

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-gray-500 mb-1.5">
                Votre prénom (optionnel)
              </label>
              <input
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="Ex. : Sophie"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-[#0F2A44] outline-none focus:border-[#C9A24D] transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-gray-500 mb-1.5">
                Votre lien (optionnel)
              </label>
              <input
                type="text"
                value={relationship}
                onChange={(e) => setRelationship(e.target.value)}
                placeholder="Ex. : ami d'enfance, collègue…"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-[#0F2A44] outline-none focus:border-[#C9A24D] transition-colors"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                Votre souvenir <span className="text-red-400 normal-case font-normal tracking-normal">(requis)</span>
              </label>
              <span className={`text-xs transition-colors ${words < MIN_CONTENT_WORDS ? 'text-amber-500' : 'text-emerald-600'}`}>
                {words === 0
                  ? `Minimum ${MIN_CONTENT_WORDS} mots`
                  : words < MIN_CONTENT_WORDS
                  ? `${words} mot${words > 1 ? 's' : ''} — encore ${MIN_CONTENT_WORDS - words}`
                  : `${words} mot${words > 1 ? 's' : ''}`}
              </span>
            </div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={7}
              placeholder="Racontez librement : un souvenir, une qualité, une anecdote qui vous vient à l'esprit…"
              className="w-full rounded-xl border-2 border-dashed border-gray-200 focus:border-[#C9A24D] px-5 py-4 text-sm text-[#0F2A44] leading-relaxed outline-none resize-none transition-colors"
              style={{ fontFamily: 'Georgia, serif' }}
            />
          </div>
        </div>

        {/* Erreur */}
        {submitError && (
          <div className="mt-4 rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700">
            {submitError}
          </div>
        )}

        {/* CTA */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-400 italic">
            Votre souvenir sera relu avant d'être intégré.
          </p>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="inline-flex items-center gap-2 rounded-full bg-[#C9A24D] px-8 py-3 text-sm font-semibold text-[#0F2A44] transition-colors hover:bg-[#E1C97A] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            <span>Envoyer mon souvenir</span>
          </button>
        </div>
      </div>
    </div>
  );
}
