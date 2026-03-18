'use client';

import Link from 'next/link';
import ProShell from '@/components/pro/ProShell';
import StatCard from '@/components/pro/StatCard';
import { computeCommissionSummary } from '@/lib/pro/finance';
import { useProStore } from '@/lib/pro/store';

export default function ProAccueilPage() {
  const { state, hydrated } = useProStore();

  if (!hydrated) {
    return (
      <ProShell title="Accueil" subtitle="Chargement du dashboard pro...">
        <div className="rounded-2xl border border-[#D8DEE5] bg-white p-6 text-sm text-[#5A6B7B]">Chargement...</div>
      </ProShell>
    );
  }

  const summary = computeCommissionSummary(state);

  return (
    <ProShell
      title="Accueil"
      subtitle="Vue synthese: Solenn, memorials vendus, commissions et renouvellement"
    >
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Ceremonies Solenn" value={String(state.solennSessions.length)} />
        <StatCard label="Memoriaux vendus" value={String(summary.soldCount)} />
        <StatCard label="Solde commission" value={`${summary.currentCredit.toFixed(0)} EUR`} />
        <StatCard
          label="Renouvellement"
          value={new Date(summary.renewalDate).toLocaleDateString('fr-FR')}
          hint={summary.isRenewalCovered ? 'Couvert par le credit agence' : `Reste ${summary.renewalGap.toFixed(0)} EUR a regler`}
        />
      </section>

      <section className="mt-6 rounded-2xl border border-[#D8DEE5] bg-white p-6">
        <h2 className="text-lg font-semibold">Actions rapides</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href="/pro/solenn" className="rounded-lg bg-[#13212E] px-4 py-2 text-sm font-medium text-white">
            Nouvelle redaction
          </Link>
          <Link href="/pro/memoriaux" className="rounded-lg border border-[#13212E] px-4 py-2 text-sm font-medium text-[#13212E]">
            Nouveau memorial
          </Link>
          <Link href="/pro/commissions" className="rounded-lg border border-[#13212E] px-4 py-2 text-sm font-medium text-[#13212E]">
            Voir solde
          </Link>
        </div>
      </section>
    </ProShell>
  );
}
