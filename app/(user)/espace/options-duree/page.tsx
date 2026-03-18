'use client';

import UserDashboardShell from '@/components/user-dashboard/UserDashboardShell';
import { useUserDashboard } from '@/lib/user-dashboard/useUserDashboard';

export default function EspaceOptionsDureePage() {
  const { data, loading } = useUserDashboard();

  if (loading) {
    return (
      <UserDashboardShell title="Options & duree" subtitle="Chargement...">
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-4 text-sm text-[#6B7280]">Chargement...</div>
      </UserDashboardShell>
    );
  }

  const active = data.memorials.find((memorial) => memorial.canAdminister) || data.memorials[0];

  return (
    <UserDashboardShell title="Options & duree" subtitle="Formule, expiration et extensions">
      <section className="rounded-2xl border border-[#E5E7EB] bg-white p-5">
        <h2 className="text-lg font-semibold">Formule actuelle</h2>
        {active ? (
          <div className="mt-3 text-sm text-[#334155] space-y-1">
            <p>Memorial: {active.title}</p>
            <p>Formule: {active.formula}</p>
            <p>Expiration: {active.expiresAt ? new Date(active.expiresAt).toLocaleDateString('fr-FR') : 'Non definie'}</p>
          </div>
        ) : (
          <p className="mt-2 text-sm text-[#6B7280]">Aucun memorial actif.</p>
        )}
      </section>

      <section className="mt-5 rounded-2xl border border-[#E5E7EB] bg-white p-5">
        <h2 className="text-lg font-semibold">Actions disponibles</h2>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <button className="rounded-lg border px-3 py-2 text-sm">Ajouter galerie illimitee</button>
          <button className="rounded-lg border px-3 py-2 text-sm">Ajouter video</button>
          <button className="rounded-lg border px-3 py-2 text-sm">Ajouter audio</button>
          <button className="rounded-lg border px-3 py-2 text-sm">Acheter QR supplementaire</button>
          <button className="rounded-lg border px-3 py-2 text-sm">Prolonger 5 ans</button>
          <button className="rounded-lg border px-3 py-2 text-sm">Extension 30 ans</button>
        </div>
        <p className="mt-3 text-xs text-[#6B7280]">Paiement Stripe Checkout a brancher sur chaque action.</p>
      </section>
    </UserDashboardShell>
  );
}
