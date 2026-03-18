'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Calendar,
  Clock3,
  FileText,
  HardDrive,
  HeartHandshake,
  Lock,
  Mail,
  Trash2,
  User,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

type AccountPayload = {
  user: {
    id: string;
    email: string;
    name: string;
    createdAt: string | null;
  };
  summary: {
    memorialCount: number;
    totalMessages: number;
    totalCandles: number;
    collaborationCount: number;
    pendingCollaborationInvitesCount: number;
  };
  memorials: Array<{
    id: string;
    title: string;
  }>;
  collaborations: Array<{
    id: string;
    title: string;
    role: string;
    joinedAt: string | null;
    lastSeenAt: string | null;
    publicationStatus: string;
    publicUrl: string;
  }>;
  pendingCollaborationInvites: Array<{
    id: string;
    title: string;
    role: string;
    expiresAt: string;
  }>;
  recentCollaborationActivity: Array<{
    id: string;
    memoryTitle: string;
    actorEmail: string | null;
    action: string;
    createdAt: string;
  }>;
};

function formatRole(role: string) {
  if (role === 'editor') return 'Co-editeur';
  if (role === 'viewer') return 'Lecture seule';
  if (role === 'owner') return 'Proprietaire';
  return 'Contributeur';
}

function formatActivity(entry: AccountPayload['recentCollaborationActivity'][number]) {
  const email = entry.actorEmail || 'Quelqu un';
  if (entry.action === 'invite_claimed') return `${email} a active un acces sur ${entry.memoryTitle}.`;
  if (entry.action === 'contribution_submitted') return `${email} a depose un souvenir sur ${entry.memoryTitle}.`;
  if (entry.action === 'memorial_text_generated') return `${email} a relance le texte de ${entry.memoryTitle}.`;
  if (entry.action === 'text_version_saved') return `${email} a enregistre une nouvelle version sur ${entry.memoryTitle}.`;
  return `${email} a realise une action sur ${entry.memoryTitle}.`;
}

export default function AccountPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AccountPayload | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const fetchAccount = async () => {
      try {
        setLoading(true);
        setErrorMessage('');

        const { data: auth } = await supabase.auth.getUser();
        if (!auth.user) {
          router.push('/login?returnUrl=%2Fdashboard%2Faccount');
          return;
        }

        const session = await supabase.auth.getSession();
        const accessToken = session.data.session?.access_token;
        if (!accessToken) {
          router.push('/login?returnUrl=%2Fdashboard%2Faccount');
          return;
        }

        const response = await fetch('/api/user-dashboard/data', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        const payload = await response.json().catch(() => null);
        if (!response.ok) {
          throw new Error(payload?.error || 'Chargement du compte impossible');
        }

        setData(payload);
      } catch (error: any) {
        console.error('Account page load error:', error);
        setErrorMessage(error?.message || 'Le compte ne peut pas encore etre charge.');
      } finally {
        setLoading(false);
      }
    };

    void fetchAccount();
  }, [router]);

  if (loading) {
    return <div className="min-h-screen bg-[#F5F4F2] py-12 px-6 text-center text-gray-500">Chargement du compte...</div>;
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-[#F5F4F2] py-12 px-6">
        <div className="max-w-3xl mx-auto rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
          {errorMessage || 'Le compte ne peut pas être affiché pour le moment.'}
        </div>
      </div>
    );
  }

  const displayName = data.user.name || data.user.email || 'Votre compte';
  const createdAt = data.user.createdAt
    ? new Date(data.user.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
    : 'Date indisponible';

  return (
    <div className="min-h-screen bg-[#F5F4F2] py-12 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <Link href="/dashboard" className="text-gray-500 hover:text-[#0F2A44] transition-colors flex items-center gap-2 mb-4">
            <ArrowLeft className="w-4 h-4" />
            Retour au tableau de bord
          </Link>
          <h1 className="text-3xl font-serif text-[#0F2A44] italic">Mon compte</h1>
          <p className="text-gray-600">Retrouvez vos espaces, vos collaborations et quelques reperes utiles.</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#C9A24D]/10">
              <h2 className="text-lg font-medium text-[#0F2A44] mb-6 flex items-center gap-2">
                <User className="w-5 h-5 text-[#C9A24D]" />
                Informations essentielles
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-gray-400 font-medium mb-1">Email</label>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg text-gray-500 border border-gray-100">
                    <Mail className="w-4 h-4" />
                    {data.user.email}
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-gray-400 font-medium mb-1">Nom d affichage</label>
                  <div className="p-3 bg-white rounded-lg text-[#0F2A44] border border-gray-200">
                    {displayName}
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-gray-400 font-medium mb-1">Date d inscription</label>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg text-gray-500 border border-gray-100">
                    <Calendar className="w-4 h-4" />
                    {createdAt}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#C9A24D]/10">
              <h2 className="text-lg font-medium text-[#0F2A44] mb-6 flex items-center gap-2">
                <HeartHandshake className="w-5 h-5 text-[#C9A24D]" />
                Espaces partages avec moi
              </h2>

              {data.collaborations.length === 0 ? (
                <div className="rounded-xl border border-dashed border-gray-200 p-5 text-sm text-gray-500">
                  Aucun espace partage actif pour le moment.
                </div>
              ) : (
                <div className="space-y-4">
                  {data.collaborations.map((collaboration) => (
                    <div key={collaboration.id} className="rounded-xl border border-gray-100 p-4">
                      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div>
                          <p className="font-medium text-[#0F2A44]">{collaboration.title}</p>
                          <p className="mt-1 text-sm text-gray-500">{formatRole(collaboration.role)}</p>
                          <p className="mt-1 text-xs text-gray-400">
                            Rejoint le {collaboration.joinedAt ? new Date(collaboration.joinedAt).toLocaleDateString('fr-FR') : 'date indisponible'}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Link
                            href={`/dashboard/${collaboration.id}/text`}
                            className="rounded-full border border-gray-200 px-4 py-2 text-sm text-[#0F2A44] hover:border-[#C9A24D]"
                          >
                            Ouvrir
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {data.pendingCollaborationInvites.length > 0 && (
                <div className="mt-6 rounded-xl bg-[#FFF9F5] p-4 border border-[#E7D9C8]">
                  <p className="text-sm font-medium text-[#7A3F1E]">Invitations en attente</p>
                  <div className="mt-3 space-y-2 text-sm text-[#7A3F1E]/80">
                    {data.pendingCollaborationInvites.map((invite) => (
                      <p key={invite.id}>
                        {invite.title} • {formatRole(invite.role)} • expire le {new Date(invite.expiresAt).toLocaleDateString('fr-FR')}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#C9A24D]/10">
              <h2 className="text-lg font-medium text-[#0F2A44] mb-6 flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#C9A24D]" />
                Statistiques
              </h2>

              <div className="grid grid-cols-1 gap-4">
                <div className="p-4 bg-[#F5F4F2] rounded-xl flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Espaces créés</p>
                    <p className="text-2xl font-serif text-[#0F2A44]">{data.summary.memorialCount}</p>
                  </div>
                  <FileText className="w-8 h-8 text-[#C9A24D]/40" />
                </div>
                <div className="p-4 bg-[#F5F4F2] rounded-xl flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Collaborations actives</p>
                    <p className="text-2xl font-serif text-[#0F2A44]">{data.summary.collaborationCount}</p>
                  </div>
                  <HeartHandshake className="w-8 h-8 text-[#C9A24D]/40" />
                </div>
                <div className="p-4 bg-[#F5F4F2] rounded-xl flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Messages et bougies</p>
                    <p className="text-2xl font-serif text-[#0F2A44]">
                      {data.summary.totalMessages + data.summary.totalCandles}
                    </p>
                  </div>
                  <HardDrive className="w-8 h-8 text-[#C9A24D]/40" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#C9A24D]/10">
              <h2 className="text-lg font-medium text-[#0F2A44] mb-4 flex items-center gap-2">
                <Clock3 className="w-5 h-5 text-[#C9A24D]" />
                Activite recente
              </h2>

              {data.recentCollaborationActivity.length === 0 ? (
                <div className="rounded-xl border border-dashed border-gray-200 p-4 text-sm text-gray-500">
                  Aucune activite collaborative recente.
                </div>
              ) : (
                <div className="space-y-3">
                  {data.recentCollaborationActivity.slice(0, 8).map((entry) => (
                    <div key={entry.id} className="rounded-xl bg-[#F5F4F2] p-4">
                      <p className="text-sm text-[#0F2A44]">{formatActivity(entry)}</p>
                      <p className="mt-1 text-xs text-gray-400">{new Date(entry.createdAt).toLocaleString('fr-FR')}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#C9A24D]/10">
              <h2 className="text-lg font-medium text-[#0F2A44] mb-6 flex items-center gap-2">
                <Lock className="w-5 h-5 text-[#C9A24D]" />
                Securite & Confidentialite
              </h2>

              <div className="space-y-4">
                <Link href="/mot-de-passe-oublie" className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-[#0F2A44]/20 hover:bg-gray-50 transition-all group">
                  <span className="text-[#0F2A44] font-medium group-hover:text-[#0F2A44]">Modifier mon mot de passe</span>
                  <Lock className="w-4 h-4 text-gray-400 group-hover:text-[#0F2A44]" />
                </Link>

                <div className="w-full flex items-center justify-between p-4 rounded-xl border border-red-100 bg-red-50/40 text-left">
                  <span className="text-red-600 font-medium">Suppression du compte</span>
                  <Trash2 className="w-4 h-4 text-red-400" />
                </div>
                <p className="text-xs text-gray-400 px-1">Cette action n est pas encore automatisee. Elle doit etre geree manuellement pour proteger vos donnees sensibles.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
