'use client';

import { ChangeEvent, useEffect, useState } from 'react';
import ProShell from '@/components/pro/ProShell';
import { useProStore } from '@/lib/pro/store';

export default function ProBrandingPage() {
  const { state, actions, hydrated, permissions } = useProStore();
  const [draft, setDraft] = useState(state.branding);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setDraft(state.branding);
  }, [state.branding]);

  if (!hydrated) {
    return (
      <ProShell title="Branding" subtitle="Chargement...">
        <div className="rounded-2xl border border-[#D8DEE5] bg-white p-6 text-sm text-[#5A6B7B]">Chargement...</div>
      </ProShell>
    );
  }

  const onInput = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setDraft((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const save = async () => {
    setSaving(true);
    try {
      await actions.updateBranding(draft);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ProShell title="Branding agence" subtitle="Personnalisation selon formule Base / Pro / Premium">
      <section className="rounded-2xl border border-[#D8DEE5] bg-white p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">Niveau</label>
            <select name="level" value={draft.level} onChange={onInput} className="w-full rounded-lg border p-2 text-sm" disabled={!permissions.canAdmin}>
              <option value="base">Base</option>
              <option value="pro">Pro</option>
              <option value="premium">Premium</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Nom agence affiche</label>
            <input name="displayName" value={draft.displayName} onChange={onInput} className="w-full rounded-lg border p-2 text-sm" disabled={!permissions.canAdmin} />
          </div>
          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium">Mention partenaire (toujours conservee)</label>
            <input name="partnerMention" value={draft.partnerMention} onChange={onInput} className="w-full rounded-lg border p-2 text-sm" disabled={!permissions.canAdmin} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Logo URL (Pro+)</label>
            <input name="logoUrl" value={draft.logoUrl || ''} onChange={onInput} className="w-full rounded-lg border p-2 text-sm" disabled={!permissions.canAdmin} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Signature (Pro+)</label>
            <input name="signature" value={draft.signature || ''} onChange={onInput} className="w-full rounded-lg border p-2 text-sm" disabled={!permissions.canAdmin} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Couleur principale (Premium)</label>
            <input name="primaryColor" value={draft.primaryColor || ''} onChange={onInput} className="w-full rounded-lg border p-2 text-sm" disabled={!permissions.canAdmin} />
          </div>
          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium">Message personnalise (Premium)</label>
            <textarea name="customMessage" value={draft.customMessage || ''} onChange={onInput} className="min-h-[90px] w-full rounded-lg border p-2 text-sm" disabled={!permissions.canAdmin} />
          </div>
        </div>
        <div className="mt-4">
          <button onClick={save} disabled={!permissions.canAdmin || saving} className="rounded-lg bg-[#13212E] px-4 py-2 text-sm font-medium text-white disabled:opacity-50">
            {saving ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-[#D8DEE5] bg-white p-6">
        <h2 className="text-lg font-semibold">Apercu</h2>
        <div className="mt-3 rounded-xl border border-[#E4EAF0] p-4" style={{ borderColor: draft.primaryColor || '#E4EAF0' }}>
          <p className="text-sm font-semibold">{draft.displayName}</p>
          <p className="mt-1 text-sm text-[#5A6B7B]">{draft.customMessage || 'Message agence'}</p>
          <p className="mt-3 text-xs text-[#6B7A89]">Footer obligatoire: {draft.partnerMention}</p>
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-[#D8DEE5] bg-white p-6">
        <h2 className="text-lg font-semibold">Template demo rendez-vous commercial</h2>
        <p className="mt-1 text-sm text-[#5A6B7B]">
          Exemple de memorial co-brandé avec logo partenaire PF, sans accès au contenu sensible.
        </p>
        <div className="mt-4 overflow-hidden rounded-2xl border border-[#E4EAF0]">
          <div className="flex items-center justify-between border-b border-[#E4EAF0] bg-[#FAFBFC] px-4 py-3">
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={draft.logoUrl || '/pf-demo-logo.svg'}
                alt="Logo agence"
                className="h-9 w-9 rounded object-cover"
              />
              <div>
                <p className="text-sm font-semibold text-[#1F2B35]">{draft.displayName || 'Agence partenaire'}</p>
                <p className="text-xs text-[#6B7A89]">Espace memorial public co-brandé</p>
              </div>
            </div>
            <span className="text-xs text-[#6B7A89]">{draft.partnerMention || 'En partenariat avec Commun Vivant'}</span>
          </div>
          <div className="bg-white px-4 py-5">
            <h3 className="text-base font-semibold text-[#1F2B35]">Mina, 1945 - 2024</h3>
            <p className="mt-2 text-sm text-[#5A6B7B]">
              “Le sourire d&apos;une grand-mere et le plus doux des tresors”
            </p>
            <div className="mt-4 grid gap-2 sm:grid-cols-3">
              <div className="rounded-lg border border-[#E4EAF0] p-3 text-xs text-[#5A6B7B]">URL publique</div>
              <div className="rounded-lg border border-[#E4EAF0] p-3 text-xs text-[#5A6B7B]">QR telechargeable</div>
              <div className="rounded-lg border border-[#E4EAF0] p-3 text-xs text-[#5A6B7B]">Statut NFC</div>
            </div>
          </div>
        </div>
      </section>
    </ProShell>
  );
}
