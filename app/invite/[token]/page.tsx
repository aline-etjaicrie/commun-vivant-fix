'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';

type InviteState =
  | { status: 'loading' }
  | { status: 'invalid'; reason: string }
  | { status: 'expired' }
  | { status: 'valid'; memoryTitle: string; inviteEmail: string; role: string; accessCode: string | null }
  | { status: 'error' };

export default function InvitePage() {
  const router = useRouter();
  const params = useParams();
  const token = String(params?.token || '');
  const [state, setState] = useState<InviteState>({ status: 'loading' });

  useEffect(() => {
    if (!token) {
      setState({ status: 'invalid', reason: 'Lien invalide.' });
      return;
    }
    fetch(`/api/memory-invites/${token}`)
      .then(async (res) => {
        if (res.status === 404) {
          setState({ status: 'invalid', reason: "Ce lien n'existe pas." });
          return;
        }
        if (!res.ok) {
          setState({ status: 'error' });
          return;
        }
        const data = await res.json();
        const invite = data?.invite;
        const memory = data?.memory;
        if (!invite) {
          setState({ status: 'invalid', reason: "Invitation introuvable." });
          return;
        }
        if (invite.status === 'expired' || invite.status === 'revoked') {
          setState({ status: 'expired' });
          return;
        }
        setState({
          status: 'valid',
          memoryTitle: memory?.title || 'cet espace mémoire',
          inviteEmail: invite.email || '',
          role: invite.role || 'contributor',
          accessCode: invite.accessCode || null,
        });
      })
      .catch(() => setState({ status: 'error' }));
  }, [token]);

  if (state.status === 'loading') {
    return (
      <div className="min-h-screen bg-[#0F2A44] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#C9A24D] animate-spin mx-auto mb-4" />
          <p className="text-[#C9A24D] text-lg">Vérification de votre invitation...</p>
        </div>
      </div>
    );
  }

  if (state.status === 'expired') {
    return (
      <div className="min-h-screen bg-[#0F2A44] flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl p-8 max-w-md text-center">
          <p className="text-2xl mb-4">⏳</p>
          <h1 className="text-2xl text-[#0F2A44] mb-4 font-medium">Invitation expirée</h1>
          <p className="text-gray-600 mb-6">
            Ce lien n'est plus valide. Demandez à la personne qui vous a invité de vous envoyer un nouveau lien.
          </p>
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-[#C9A24D] text-[#0F2A44] rounded-lg hover:bg-[#E1C97A] transition-colors"
          >
            Retour à l'accueil
          </Link>
        </div>
      </div>
    );
  }

  if (state.status === 'invalid' || state.status === 'error') {
    return (
      <div className="min-h-screen bg-[#0F2A44] flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl p-8 max-w-md text-center">
          <p className="text-2xl mb-4">❌</p>
          <h1 className="text-2xl text-[#0F2A44] mb-4 font-medium">Invitation invalide</h1>
          <p className="text-gray-600 mb-6">
            {state.status === 'invalid' ? state.reason : "Une erreur est survenue. Réessayez dans quelques instants."}
          </p>
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-[#C9A24D] text-[#0F2A44] rounded-lg hover:bg-[#E1C97A] transition-colors"
          >
            Retour à l'accueil
          </Link>
        </div>
      </div>
    );
  }

  // state.status === 'valid'
  const { memoryTitle, accessCode, role } = state;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0F2A44] to-[#1C3B5A] flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl p-8 md:p-12 max-w-2xl w-full shadow-2xl">
        <div className="text-center mb-8">
          <Image src="/logo.png" alt="Commun Vivant" width={80} height={80} className="w-20 h-20 rounded-full mx-auto mb-4" />
          <h1
            className="text-3xl md:text-4xl text-[#0F2A44] mb-3 font-normal"
            style={{ fontFamily: 'var(--font-calli), cursive', fontStyle: 'italic' }}
          >
            Vous êtes invité
          </h1>
          <p className="text-xl text-gray-600">à contribuer au mémorial de</p>
          <p
            className="text-2xl text-[#C9A24D] mt-2 font-medium"
            style={{ fontFamily: 'var(--font-calli), cursive', fontStyle: 'italic' }}
          >
            {memoryTitle}
          </p>
        </div>

        <div className="bg-[#F5F4F2] rounded-xl p-6 mb-6">
          <p className="text-gray-700 leading-relaxed italic">
            Votre témoignage est précieux. Partagez vos souvenirs, vos anecdotes, ce qui rendait cette
            personne unique à vos yeux. Votre contribution sera intégrée dans le mémorial final.
          </p>
        </div>

        {accessCode && (
          <div className="bg-[#FFF8EC] border border-[#E7D9C8] rounded-xl p-4 mb-6 text-center">
            <p className="text-xs uppercase tracking-widest text-[#7A6B5C] mb-1">Votre code d'accès</p>
            <p className="text-3xl font-bold tracking-[0.25em] text-[#7A3F1E]">{accessCode}</p>
          </div>
        )}

        <div className="mb-8">
          <h2 className="text-xl text-[#0F2A44] font-medium mb-4 text-center">
            Comment souhaitez-vous contribuer ?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => router.push(`/honorer/alma?inviteToken=${token}`)}
              className="group p-6 border-2 border-[#C9A24D]/30 rounded-xl hover:border-[#C9A24D] hover:bg-[#C9A24D]/5 transition-all text-left"
            >
              <div className="w-16 h-16 bg-[#C9A24D]/10 rounded-full flex items-center justify-center mb-4 group-hover:bg-[#C9A24D]/20 transition-colors">
                <span className="text-3xl">💬</span>
              </div>
              <h3 className="text-lg font-medium text-[#0F2A44] mb-2">Avec Alma</h3>
              <p className="text-sm text-gray-600">Conversation guidée avec notre IA bienveillante</p>
            </button>

            <button
              onClick={() => router.push(`/honorer/questionnaire?inviteToken=${token}`)}
              className="group p-6 border-2 border-[#C9A24D]/30 rounded-xl hover:border-[#C9A24D] hover:bg-[#C9A24D]/5 transition-all text-left"
            >
              <div className="w-16 h-16 bg-[#C9A24D]/10 rounded-full flex items-center justify-center mb-4 group-hover:bg-[#C9A24D]/20 transition-colors">
                <span className="text-3xl">📝</span>
              </div>
              <h3 className="text-lg font-medium text-[#0F2A44] mb-2">Questionnaire</h3>
              <p className="text-sm text-gray-600">Répondez à des questions structurées à votre rythme</p>
            </button>
          </div>
        </div>

        <div className="text-center text-sm text-gray-500">
          <p>Temps estimé : 15–30 minutes</p>
          {role === 'contributor' && (
            <p className="mt-1">Votre accès : contributeur</p>
          )}
        </div>
      </div>
    </div>
  );
}
