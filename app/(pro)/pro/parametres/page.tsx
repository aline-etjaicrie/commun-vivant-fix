'use client';

import { ChangeEvent, useEffect, useState } from 'react';
import ProShell from '@/components/pro/ProShell';
import { useProStore } from '@/lib/pro/store';

const PLAN_PRICES: Record<'base' | 'pro' | 'premium', number> = {
  base: 290,
  pro: 490,
  premium: 890,
};

export default function ProParametresPage() {
  const { state, actions, hydrated, permissions } = useProStore();
  const [draft, setDraft] = useState(state.agency);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setDraft(state.agency);
  }, [state.agency]);

  if (!hydrated) {
    return (
      <ProShell title="Parametres" subtitle="Chargement...">
        <div className="rounded-2xl border border-[#D8DEE5] bg-white p-6 text-sm text-[#5A6B7B]">Chargement...</div>
      </ProShell>
    );
  }

  const onAgency = (e: ChangeEvent<HTMLInputElement>) => {
    setDraft((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const save = async () => {
    setSaving(true);
    try {
      await actions.setAgencyInfo({
        name: draft.name,
        subscriptionRenewalDate: draft.subscriptionRenewalDate,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <ProShell title="Parametres" subtitle="Informations agence, facturation et statut abonnement">
      <section className="rounded-2xl border border-[#D8DEE5] bg-white p-6">
        <h2 className="text-lg font-semibold">Informations agence</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">Nom agence</label>
            <input disabled={!permissions.canAdmin} name="name" value={draft.name} onChange={onAgency} className="w-full rounded-lg border p-2 text-sm disabled:opacity-50" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Date renouvellement</label>
            <input
              disabled={!permissions.canAdmin}
              name="subscriptionRenewalDate"
              type="date"
              value={(draft.subscriptionRenewalDate || '').slice(0, 10)}
              onChange={onAgency}
              className="w-full rounded-lg border p-2 text-sm disabled:opacity-50"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Formule</label>
            <select
              disabled={!permissions.canAdmin}
              value={draft.subscriptionType}
              onChange={async (e) => {
                const next = e.target.value as 'base' | 'pro' | 'premium';
                setDraft((prev) => ({ ...prev, subscriptionType: next, subscriptionPrice: PLAN_PRICES[next] }));
                await actions.setSubscriptionType(next, PLAN_PRICES[next]);
              }}
              className="w-full rounded-lg border p-2 text-sm disabled:opacity-50"
            >
              <option value="base">Base</option>
              <option value="pro">Pro</option>
              <option value="premium">Premium</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Prix abonnement</label>
            <input value={`${draft.subscriptionPrice} EUR`} disabled className="w-full rounded-lg border bg-[#F8FAFC] p-2 text-sm" />
          </div>
        </div>
        <div className="mt-4">
          <button onClick={save} disabled={!permissions.canAdmin || saving} className="rounded-lg bg-[#13212E] px-4 py-2 text-sm font-medium text-white disabled:opacity-50">
            {saving ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-[#D8DEE5] bg-white p-6">
        <h2 className="text-lg font-semibold">Facturation</h2>
        <p className="mt-2 text-sm text-[#5A6B7B]">MVP: telechargement factures a brancher sur provider billing.</p>
        <div className="mt-4 flex gap-2">
          <button className="rounded-lg border px-4 py-2 text-sm">Facture abonnement PDF</button>
          <button className="rounded-lg border px-4 py-2 text-sm">Historique annuel</button>
        </div>
      </section>
    </ProShell>
  );
}
