'use client';

import Link from 'next/link';
import UserContextActions from '@/components/user-dashboard/UserContextActions';
import UserDashboardShell from '@/components/user-dashboard/UserDashboardShell';
import UserProjectSpotlight from '@/components/user-dashboard/UserProjectSpotlight';
import UserRecentActivity from '@/components/user-dashboard/UserRecentActivity';
import UserStatCard from '@/components/user-dashboard/UserStatCard';
import {
  buildRecentDashboardActivity,
  getDashboardActions,
  getPrimaryDashboardAction,
  selectDashboardFocusMemorial,
} from '@/lib/user-dashboard/presentation';
import { useUserDashboard } from '@/lib/user-dashboard/useUserDashboard';

export default function EspaceAccueilPage() {
  const { data, loading } = useUserDashboard();

  if (loading) {
    return (
      <UserDashboardShell title="Accueil" subtitle="Chargement de votre espace personnel...">
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-4 text-sm text-[#6B7280]">Chargement...</div>
      </UserDashboardShell>
    );
  }

  const focusMemorial = selectDashboardFocusMemorial(data.memorials);
  const primaryAction = focusMemorial ? getPrimaryDashboardAction(focusMemorial) : null;
  const contextualActions = focusMemorial ? getDashboardActions(focusMemorial) : [];
  const recentActivity = buildRecentDashboardActivity(data, focusMemorial?.id);
  const fallbackActivity =
    recentActivity.length > 0 ? recentActivity : buildRecentDashboardActivity(data);

  return (
    <UserDashboardShell
      title="Accueil"
      subtitle="Reprenez votre projet, suivez les contributions récentes et avancez sans détour."
    >
      {focusMemorial && primaryAction ? (
        <UserProjectSpotlight memorial={focusMemorial} primaryAction={primaryAction} />
      ) : (
        <section className="rounded-[28px] border border-dashed border-[#D6D8DD] bg-white p-8">
          <p className="text-xs uppercase tracking-[0.18em] text-[#6B7280]">Premier projet</p>
          <h2 className="mt-3 text-3xl font-semibold text-[#102132]">Commencez un espace de mémoire</h2>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-[#516173]">
            Vous n’avez pas encore de projet actif. Créez un premier espace pour transmettre, célébrer
            ou honorer une mémoire, puis retrouvez ici toutes les étapes utiles pour le faire avancer.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/create/selection"
              className="rounded-full bg-[#102132] px-5 py-3 text-sm font-medium text-white transition-transform hover:scale-[1.02]"
            >
              Créer un nouveau projet
            </Link>
            <Link
              href="/exemple"
              className="rounded-full border border-[#D6D8DD] px-5 py-3 text-sm font-medium text-[#102132] transition-colors hover:bg-[#F8F7F4]"
            >
              Voir des exemples
            </Link>
          </div>
        </section>
      )}

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <UserStatCard label="Projets créés" value={String(data.summary.memorialCount)} />
        <UserStatCard label="Brouillons" value={String(data.summary.draftCount)} />
        <UserStatCard label="Publié(s)" value={String(data.summary.publishedCount)} />
        <UserStatCard
          label="Messages reçus"
          value={String(data.summary.totalMessages)}
          hint={`${data.summary.totalCandles} bougies`}
        />
      </section>

      {focusMemorial ? <UserContextActions actions={contextualActions} /> : null}

      <UserRecentActivity items={fallbackActivity} />
    </UserDashboardShell>
  );
}
