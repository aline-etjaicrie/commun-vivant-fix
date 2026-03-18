'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ChevronLeft,
  Clock3,
  Copy,
  Loader2,
  Mail,
  Send,
  ShieldCheck,
  UserPlus,
  Download,
} from 'lucide-react';
import FlowNotice from '@/components/create/FlowNotice';
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

type ContributorMembership = {
  id: string;
  email: string;
  role: string;
  status: string;
  invitedAt: string;
  joinedAt: string | null;
  lastSeenAt: string | null;
  contributionCount: number;
};

type ContributorInvite = {
  id: string;
  email: string;
  role: string;
  status: string;
  accessCode: string | null;
  expiresAt: string;
  claimedAt: string | null;
  createdAt: string;
  inviteUrl: string;
  qrDownloadUrl: string;
  contributionCount: number;
};

type InviteEmailDelivery = {
  sent: boolean;
  mode: 'sent' | 'skipped' | 'failed';
  reason?: string | null;
};

type ActivityLog = {
  id: string;
  actor_email: string | null;
  actor_role: string | null;
  source: string;
  action: string;
  target_type: string | null;
  target_id: string | null;
  metadata: Record<string, any> | null;
  created_at: string;
};

type ContributorsResponse = {
  memory: {
    id: string;
    title: string;
  };
  creator: {
    userId: string | null;
    email: string;
  };
  memberships: ContributorMembership[];
  invites: ContributorInvite[];
  recentActivity: ActivityLog[];
  summary: {
    activeCount: number;
    pendingCount: number;
    contributionCount: number;
  };
};

function InlineQRCode({ qrUrl, label }: { qrUrl: string; label?: string }) {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    let objectUrl: string | null = null;
    const load = async () => {
      try {
        const session = await supabase.auth.getSession();
        const token = session.data.session?.access_token;
        if (!token) return;
        const res = await fetch(qrUrl, { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) return;
        const blob = await res.blob();
        objectUrl = URL.createObjectURL(blob);
        setSrc(objectUrl);
      } catch {
        // QR non disponible, bouton download reste fonctionnel
      }
    };
    void load();
    return () => { if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [qrUrl]);

  if (!src) {
    return (
      <div className="h-28 w-28 animate-pulse rounded-xl bg-[#F0EAE0]" aria-label="Chargement du QR..." />
    );
  }

  return (
    <div className="flex flex-col items-center gap-1">
      <img src={src} alt={label ? `QR ${label}` : 'QR code invitation'} className="h-28 w-28 rounded-xl border border-[#E7D9C8]" />
      {label && <p className="text-center text-xs text-[#0F2A44]/40 max-w-[7rem] truncate">{label}</p>}
    </div>
  );
}

export default function ContributorsPage() {
  const router = useRouter();
  const params = useParams();
  const id = String(params?.id || '');

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<'contributor' | 'editor' | 'viewer'>('contributor');
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [data, setData] = useState<ContributorsResponse | null>(null);
  const [lastInvite, setLastInvite] = useState<ContributorInvite | null>(null);
  const [lastInviteEmailDelivery, setLastInviteEmailDelivery] = useState<InviteEmailDelivery | null>(null);
  const [notice, setNotice] = useState<{
    variant: 'error' | 'info' | 'success';
    title: string;
    message: string;
  } | null>(null);

  const activeMembers = useMemo(
    () => (data?.memberships || []).filter((membership) => membership.role !== 'owner'),
    [data]
  );

  const pendingInvites = useMemo(
    () => (data?.invites || []).filter((invite) => invite.status === 'pending'),
    [data]
  );

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const auth = await supabase.auth.getUser();
      const user = auth.data.user;
      setCurrentUser(user || null);

      if (!user) {
        router.push(`/login?returnUrl=${encodeURIComponent(`/dashboard/${id}/contributors`)}`);
        return;
      }

      const session = await supabase.auth.getSession();
      const accessToken = session.data.session?.access_token;
      if (!accessToken) {
        router.push(`/login?returnUrl=${encodeURIComponent(`/dashboard/${id}/contributors`)}`);
        return;
      }

      const response = await fetch(`/api/user-dashboard/memorials/${encodeURIComponent(id)}/contributors`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(payload?.error || 'Chargement des contributeurs impossible');
      }

      setData(payload);
    } catch (error: any) {
      console.error('Contributors page load error:', error);
      setNotice({
        variant: 'error',
        title: 'Le tableau des contributions ne peut pas encore s afficher',
        message: error?.message || 'Vous pouvez reessayer dans un instant.',
      });
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const copyToClipboard = async (value: string, label: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setNotice({
        variant: 'success',
        title: 'Copie effectuee',
        message: `${label} a bien ete copie.`,
      });
    } catch (error) {
      console.error('Clipboard error:', error);
      setNotice({
        variant: 'error',
        title: 'Copie impossible pour le moment',
        message: 'Vous pouvez selectionner le lien a la main si besoin.',
      });
    }
  };

  const getAccessToken = async () => {
    const session = await supabase.auth.getSession();
    return session.data.session?.access_token || null;
  };

  const downloadInviteQr = async (invite: ContributorInvite) => {
    try {
      const accessToken = await getAccessToken();
      if (!accessToken) {
        router.push(`/login?returnUrl=${encodeURIComponent(`/dashboard/${id}/contributors`)}`);
        return;
      }

      const response = await fetch(invite.qrDownloadUrl, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error || 'QR indisponible');
      }

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = objectUrl;
      anchor.download = `invitation-${invite.email.replace(/[^a-z0-9]+/gi, '-').toLowerCase() || 'proche'}.png`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(objectUrl);

      setNotice({
        variant: 'success',
        title: 'QR prepare',
        message: `Le QR d invitation pour ${invite.email} est pret.`,
      });
    } catch (error: any) {
      console.error('Invite QR download error:', error);
      setNotice({
        variant: 'error',
        title: 'Le QR n a pas pu etre prepare',
        message: error?.message || 'Vous pouvez reessayer dans un instant.',
      });
    }
  };

  const handleInvite = async () => {
    if (!newEmail.trim()) return;

    try {
      setSubmitting(true);
      setNotice(null);

      const accessToken = await getAccessToken();
      if (!accessToken) {
        router.push(`/login?returnUrl=${encodeURIComponent(`/dashboard/${id}/contributors`)}`);
        return;
      }

      const response = await fetch(`/api/user-dashboard/memorials/${encodeURIComponent(id)}/contributors`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          email: newEmail,
          role: newRole,
        }),
      });

      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(payload?.error || "L invitation n a pas pu etre creee.");
      }

      setLastInvite(payload?.invite || null);
      setLastInviteEmailDelivery(payload?.emailDelivery || null);
      setShowInviteModal(false);
      setNewEmail('');
      setNewRole('contributor');
      setNotice({
        variant: payload?.emailDelivery?.sent ? 'success' : 'info',
        title: payload?.emailDelivery?.sent ? 'Invitation envoyee' : 'Invitation preparee',
        message: payload?.emailDelivery?.sent
          ? `Un email a ete envoye a ${payload?.invite?.email}. Le lien, le code et le QR restent disponibles ci-dessous.`
          : `Un acces a ete cree pour ${payload?.invite?.email}. Vous pouvez partager le lien, le code ou le QR manuellement.`,
      });
      await fetchData();
    } catch (error: any) {
      console.error('Contributors invite error:', error);
      setNotice({
        variant: 'error',
        title: "L invitation n a pas encore pu etre envoyee",
        message: error?.message || 'Vous pouvez reessayer dans un instant.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const renderRole = (role: string) => {
    if (role === 'editor') return 'Co-editeur';
    if (role === 'viewer') return 'Lecture seule';
    if (role === 'owner') return 'Proprietaire';
    return 'Contributeur';
  };

  const renderStatus = (status: string) => {
    if (status === 'active' || status === 'claimed') {
      return <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">Actif</span>;
    }
    if (status === 'revoked') {
      return <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-600">Retire</span>;
    }
    return <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">En attente</span>;
  };

  const formatActivity = (entry: ActivityLog) => {
    const email = entry.actor_email || 'Quelqu un';
    if (entry.action === 'invite_created') {
      return `${email} a cree une invitation pour ${entry.metadata?.email || 'un proche'}.`;
    }
    if (entry.action === 'invite_claimed') {
      return `${email} a active son acces personnel.`;
    }
    if (entry.action === 'invite_email_sent') {
      return `${email} a envoye l invitation par email.`;
    }
    if (entry.action === 'invite_email_not_sent') {
      return `${email} a prepare une invitation sans envoi email automatique.`;
    }
    if (entry.action === 'invite_qr_downloaded') {
      return `${email} a prepare le QR d invitation.`;
    }
    if (entry.action === 'contribution_submitted') {
      return `${email} a depose un souvenir.`;
    }
    if (entry.action === 'memorial_text_generated') {
      return `${email} a relance une version du texte.`;
    }
    if (entry.action === 'text_version_saved') {
      return `${email} a enregistre une nouvelle version du texte.`;
    }
    return `${email} a realise une action sur cet espace.`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#F5F4F2] to-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-10 w-10 animate-spin text-[#C9A24D]" />
          <p className="mt-4 text-sm text-[#0F2A44]/60">Chargement des contributions partagees...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F5F4F2] to-white">
      <header className="sticky top-0 z-40 border-b border-[#C9A24D]/20 bg-white/90 shadow-sm backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link
            href={`/dashboard/${id}`}
            className="inline-flex items-center gap-2 text-[#0F2A44] transition-colors hover:text-[#C9A24D]"
          >
            <ChevronLeft className="h-5 w-5" />
            <span>Retour au tableau de bord</span>
          </Link>
          <button
            onClick={() => setShowInviteModal(true)}
            className="inline-flex items-center gap-2 rounded-full bg-[#C9A24D] px-4 py-2 text-sm font-semibold text-[#0F2A44] transition-colors hover:bg-[#E1C97A]"
          >
            <UserPlus className="h-4 w-4" />
            Inviter un proche
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-12">
        <div className="mb-10">
          <h1
            className="text-4xl font-normal text-[#0F2A44] md:text-5xl"
            style={{ fontFamily: 'var(--font-calli), cursive', fontStyle: 'italic' }}
          >
            Contributions partagees
          </h1>
          <p className="mt-3 max-w-3xl text-lg text-[#0F2A44]/65">
            Ouvrez cet espace a plusieurs voix, en gardant un cadre clair: qui rejoint l espace, qui contribue, et ce qui a ete ajoute.
          </p>
          {data?.memory?.title ? (
            <p className="mt-4 text-sm uppercase tracking-[0.2em] text-[#C9A24D]">{data.memory.title}</p>
          ) : null}
        </div>

        {notice && (
          <FlowNotice
            variant={notice.variant}
            title={notice.title}
            message={notice.message}
            className="mb-8"
          />
        )}

        {lastInvite && (
          <div className="mb-8 rounded-3xl border border-[#E7D9C8] bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-[#0F2A44]">Derniere invitation creee</h2>
            <p className="mt-1 text-sm text-[#0F2A44]/60">
              Vous pouvez partager ce lien directement, transmettre le code d acces ou preparer un QR a remettre.
            </p>
            {lastInviteEmailDelivery && (
              <div className="mt-4 rounded-2xl bg-[#F5F4F2] p-4 text-sm text-[#0F2A44]/75">
                <p className="font-medium text-[#0F2A44] flex items-center gap-2">
                  <Mail className="h-4 w-4 text-[#C9A24D]" />
                  {lastInviteEmailDelivery.sent ? 'Email envoye automatiquement' : 'Email non envoye automatiquement'}
                </p>
                {!lastInviteEmailDelivery.sent && lastInviteEmailDelivery.reason ? (
                  <p className="mt-1 text-xs text-[#0F2A44]/55">{lastInviteEmailDelivery.reason}</p>
                ) : null}
              </div>
            )}
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl bg-[#F5F4F2] p-4 md:col-span-2">
                <p className="text-xs uppercase tracking-widest text-[#0F2A44]/40">Lien</p>
                <p className="mt-2 break-all text-sm text-[#0F2A44]">{lastInvite.inviteUrl}</p>
                <div className="mt-3 flex flex-wrap gap-4">
                  <button
                    onClick={() => copyToClipboard(lastInvite.inviteUrl, 'Le lien d invitation')}
                    className="inline-flex items-center gap-2 text-sm font-medium text-[#2B5F7D] hover:underline"
                  >
                    <Copy className="h-4 w-4" />
                    Copier le lien
                  </button>
                  <button
                    onClick={() => downloadInviteQr(lastInvite)}
                    className="inline-flex items-center gap-2 text-sm font-medium text-[#0F2A44] hover:underline"
                  >
                    <Download className="h-4 w-4" />
                    Telecharger le QR
                  </button>
                </div>
                {lastInvite.accessCode && (
                  <div className="mt-4">
                    <p className="text-xs uppercase tracking-widest text-[#0F2A44]/40">Code d acces</p>
                    <p className="mt-1 text-2xl font-semibold tracking-[0.3em] text-[#7A3F1E]">
                      {lastInvite.accessCode}
                    </p>
                    <button
                      onClick={() => copyToClipboard(lastInvite.accessCode || '', 'Le code d acces')}
                      className="mt-2 inline-flex items-center gap-2 text-sm font-medium text-[#7A3F1E] hover:underline"
                    >
                      <Copy className="h-4 w-4" />
                      Copier le code
                    </button>
                  </div>
                )}
              </div>
              <div className="flex items-center justify-center rounded-2xl bg-[#FFF9F5] p-4">
                <InlineQRCode qrUrl={lastInvite.qrDownloadUrl} label={lastInvite.email} />
              </div>
            </div>
          </div>
        )}

        <div className="mb-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-[#C9A24D]/20 bg-white p-6 shadow-sm">
            <p className="text-sm text-[#0F2A44]/50">Acces actifs</p>
            <p className="mt-2 text-3xl font-semibold text-[#0F2A44]">{data?.summary.activeCount || 0}</p>
          </div>
          <div className="rounded-3xl border border-[#C9A24D]/20 bg-white p-6 shadow-sm">
            <p className="text-sm text-[#0F2A44]/50">Invitations en attente</p>
            <p className="mt-2 text-3xl font-semibold text-[#C9A24D]">{data?.summary.pendingCount || 0}</p>
          </div>
          <div className="rounded-3xl border border-[#C9A24D]/20 bg-white p-6 shadow-sm">
            <p className="text-sm text-[#0F2A44]/50">Souvenirs recueillis</p>
            <p className="mt-2 text-3xl font-semibold text-[#0F2A44]">{data?.summary.contributionCount || 0}</p>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
          <div className="space-y-8">
            <section className="rounded-3xl border border-[#E7D9C8] bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-[#0F2A44]">Vous</h2>
              <div className="mt-4 rounded-2xl bg-[#F5F4F2] p-4">
                <p className="font-medium text-[#0F2A44]">{currentUser?.user_metadata?.name || 'Vous'}</p>
                <p className="mt-1 text-sm text-[#0F2A44]/60">{currentUser?.email || data?.creator?.email || 'Adresse indisponible'}</p>
                <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-[#E9F2E8] px-3 py-1 text-xs font-medium text-[#27593A]">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Proprietaire de l espace
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-[#E7D9C8] bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-[#0F2A44]">Contributeurs actifs</h2>
                  <p className="mt-1 text-sm text-[#0F2A44]/60">Les personnes qui ont rejoint l espace et peuvent deja agir selon leur role.</p>
                </div>
                <span className="rounded-full bg-[#F5F4F2] px-3 py-1 text-sm text-[#0F2A44]/70">{activeMembers.length}</span>
              </div>

              <div className="mt-5 space-y-4">
                {activeMembers.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-[#D7D1C8] p-6 text-sm text-[#0F2A44]/50">
                    Aucun contributeur actif pour le moment.
                  </div>
                ) : (
                  activeMembers.map((member) => (
                    <div key={member.id} className="rounded-2xl border border-[#F0E4D6] p-4">
                      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div>
                          <p className="font-medium text-[#0F2A44]">{member.email}</p>
                          <p className="mt-1 text-sm text-[#0F2A44]/55">
                            {renderRole(member.role)} • {member.contributionCount} souvenir{member.contributionCount > 1 ? 's' : ''}
                          </p>
                          <p className="mt-1 text-xs text-[#0F2A44]/40">
                            Rejoint le {member.joinedAt ? new Date(member.joinedAt).toLocaleDateString('fr-FR') : 'date indisponible'}
                          </p>
                        </div>
                        {renderStatus(member.status)}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>

            <section className="rounded-3xl border border-[#E7D9C8] bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-[#0F2A44]">Invitations en attente</h2>
                  <p className="mt-1 text-sm text-[#0F2A44]/60">Liens et codes deja prepares pour les proches qui n ont pas encore rejoint l espace.</p>
                </div>
                <span className="rounded-full bg-[#FFF9F5] px-3 py-1 text-sm text-[#7A3F1E]">{pendingInvites.length}</span>
              </div>

              <div className="mt-5 space-y-4">
                {pendingInvites.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-[#D7D1C8] p-6 text-sm text-[#0F2A44]/50">
                    Aucune invitation en attente pour le moment.
                  </div>
                ) : (
                  pendingInvites.map((invite) => (
                    <div key={invite.id} className="rounded-2xl border border-[#F0E4D6] p-4">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-[#0F2A44]">{invite.email}</p>
                          <p className="mt-1 text-sm text-[#0F2A44]/55">{renderRole(invite.role)}</p>
                          <p className="mt-1 text-xs text-[#0F2A44]/40">
                            Creee le {new Date(invite.createdAt).toLocaleDateString('fr-FR')} • expire le {new Date(invite.expiresAt).toLocaleDateString('fr-FR')}
                          </p>
                          {invite.accessCode && (
                            <div className="mt-3">
                              <span className="text-xs uppercase tracking-widest text-[#0F2A44]/40">Code</span>
                              <p className="text-lg font-bold tracking-[0.25em] text-[#7A3F1E]">{invite.accessCode}</p>
                            </div>
                          )}
                          <div className="mt-3 flex flex-wrap items-center gap-2">
                            {renderStatus(invite.status)}
                            <button
                              onClick={() => copyToClipboard(invite.inviteUrl, 'Le lien d invitation')}
                              className="inline-flex items-center gap-1 rounded-full border border-[#D7D1C8] px-3 py-1 text-xs font-medium text-[#0F2A44] hover:border-[#C9A24D]"
                            >
                              <Copy className="h-3.5 w-3.5" />
                              Copier le lien
                            </button>
                            <button
                              onClick={() => downloadInviteQr(invite)}
                              className="inline-flex items-center gap-1 rounded-full border border-[#D7D1C8] px-3 py-1 text-xs font-medium text-[#0F2A44] hover:border-[#C9A24D]"
                            >
                              <Download className="h-3.5 w-3.5" />
                              Telecharger QR
                            </button>
                          </div>
                          <p className="mt-2 text-xs text-[#0F2A44]/40">
                            {invite.contributionCount} souvenir{invite.contributionCount > 1 ? 's' : ''} recu{invite.contributionCount > 1 ? 's' : ''}
                          </p>
                        </div>
                        <div className="flex-shrink-0">
                          <InlineQRCode qrUrl={invite.qrDownloadUrl} label={invite.email} />
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>

          <aside className="rounded-3xl border border-[#E7D9C8] bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2">
              <Clock3 className="h-5 w-5 text-[#C06A3A]" />
              <h2 className="text-xl font-semibold text-[#0F2A44]">Journal recent</h2>
            </div>
            <p className="mt-2 text-sm text-[#0F2A44]/60">
              Une trace simple des activations d acces et des souvenirs partages.
            </p>

            <div className="mt-6 space-y-4">
              {(data?.recentActivity || []).length === 0 ? (
                <div className="rounded-2xl border border-dashed border-[#D7D1C8] p-5 text-sm text-[#0F2A44]/50">
                  Aucune action enregistree pour le moment.
                </div>
              ) : (
                (data?.recentActivity || []).map((entry) => (
                  <div key={entry.id} className="rounded-2xl bg-[#F9F7F3] p-4">
                    <p className="text-sm font-medium text-[#0F2A44]">{formatActivity(entry)}</p>
                    <p className="mt-2 text-xs text-[#0F2A44]/40">
                      {new Date(entry.created_at).toLocaleString('fr-FR')}
                    </p>
                  </div>
                ))
              )}
            </div>
          </aside>
        </div>

        <div className="mt-10 flex justify-between">
          <button
            onClick={() => router.push(`/dashboard/${id}`)}
            className="px-5 py-3 text-[#0F2A44]/60 transition-colors hover:text-[#0F2A44]"
          >
            Retour
          </button>
          <button
            onClick={() => router.push(`/dashboard/${id}/generate`)}
            className="rounded-full bg-[#C9A24D] px-6 py-3 text-sm font-semibold text-[#0F2A44] transition-colors hover:bg-[#E1C97A]"
          >
            Continuer vers la generation
          </button>
        </div>
      </main>

      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl">
            <h3
              className="text-2xl font-medium text-[#0F2A44]"
              style={{ fontFamily: 'var(--font-calli), cursive', fontStyle: 'italic' }}
            >
              Inviter un proche
            </h3>
            <p className="mt-2 text-sm text-[#0F2A44]/60">
              Creez un acces personnel, traçable et revocable pour une contribution sensible et securisee.
            </p>

            <label className="mt-6 block">
              <span className="mb-2 block text-sm font-medium text-gray-700">Adresse email</span>
              <input
                type="email"
                value={newEmail}
                onChange={(event) => setNewEmail(event.target.value)}
                placeholder="exemple@email.fr"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-[#C9A24D]"
                autoFocus
              />
            </label>

            <label className="mt-4 block">
              <span className="mb-2 block text-sm font-medium text-gray-700">Role</span>
              <select
                value={newRole}
                onChange={(event) => setNewRole(event.target.value as 'contributor' | 'editor' | 'viewer')}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-[#C9A24D]"
              >
                <option value="contributor">Contributeur</option>
                <option value="editor">Co-editeur</option>
                <option value="viewer">Lecture seule</option>
              </select>
            </label>

            <div className="mt-8 flex gap-3">
              <button
                onClick={() => setShowInviteModal(false)}
                className="flex-1 rounded-xl border border-gray-300 px-4 py-3 transition-colors hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={handleInvite}
                disabled={submitting || !newEmail.trim()}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#C9A24D] px-4 py-3 font-medium text-[#0F2A44] transition-colors hover:bg-[#E1C97A] disabled:opacity-60"
              >
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                <span>Creer l invitation</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
