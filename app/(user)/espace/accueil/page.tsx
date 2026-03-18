'use client';

import Link from 'next/link';
import UserDashboardShell from '@/components/user-dashboard/UserDashboardShell';
import UserStatCard from '@/components/user-dashboard/UserStatCard';
import { useUserDashboard } from '@/lib/user-dashboard/useUserDashboard';

export default function EspaceAccueilPage() {
  const { data, loading } = useUserDashboard();

  if (loading) {
    return (
      <UserDashboardShell title="Accueil" subtitle="Chargement de vos memorials...">
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-4 text-sm text-[#6B7280]">Chargement...</div>
      </UserDashboardShell>
    );
  }

  const nextMemorial = data.memorials.find((memorial) => memorial.canAdminister) || data.memorials[0];

  return (
    <UserDashboardShell title="Accueil" subtitle="Retrouvez vos memorials, leur statut et leur duree">
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <UserStatCard label="Memoriaux crees" value={String(data.summary.memorialCount)} />
        <UserStatCard label="Brouillons" value={String(data.summary.draftCount)} />
        <UserStatCard label="Publies" value={String(data.summary.publishedCount)} />
        <UserStatCard label="Messages recus" value={String(data.summary.totalMessages)} hint={`${data.summary.totalCandles} bougies`} />
      </section>

      <section className="mt-5 rounded-2xl border border-[#E5E7EB] bg-white p-5">
        <h2 className="text-lg font-semibold">Actions rapides</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link href="/create/selection" className="rounded-lg bg-[#1B2D3E] px-4 py-2 text-sm font-medium text-white">Creer un nouveau memorial</Link>
          <Link href="/espace/memoriaux" className="rounded-lg border border-[#1B2D3E] px-4 py-2 text-sm font-medium text-[#1B2D3E]">Modifier un memorial</Link>
          {nextMemorial ? (
            <a href={nextMemorial.publicUrl} target="_blank" rel="noreferrer" className="rounded-lg border border-[#1B2D3E] px-4 py-2 text-sm font-medium text-[#1B2D3E]">Voir page publique</a>
          ) : null}
        </div>
      </section>
    </UserDashboardShell>
  );
}
