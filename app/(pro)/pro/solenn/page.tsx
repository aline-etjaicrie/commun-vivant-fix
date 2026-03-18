'use client';

import Link from 'next/link';
import ProShell from '@/components/pro/ProShell';
import { useProStore } from '@/lib/pro/store';

export default function ProSolennPage() {
  const { state, actions, hydrated, permissions } = useProStore();

  if (!hydrated) {
    return (
      <ProShell title="Solenn" subtitle="Chargement...">
        <div className="rounded-2xl border border-[#D8DEE5] bg-white p-6 text-sm text-[#5A6B7B]">Chargement...</div>
      </ProShell>
    );
  }

  return (
    <ProShell
      title="Solenn - Rediger une ceremonie"
      subtitle="Module pro pour textes de ceremonies civiles (5/10/15 min)"
    >
      <section className="rounded-2xl border border-[#D8DEE5] bg-white p-6">
        <h2 className="text-lg font-semibold">Usage du module</h2>
        <p className="mt-2 text-sm text-[#5A6B7B]">
          Le moteur Solenn complet est accessible dans l'ecran dedie. Depuis cet espace Pro, vous gardez un suivi operationnel
          des redactions et vous pouvez rattacher une redaction a un memorial.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href="/solenn" className="rounded-lg bg-[#13212E] px-4 py-2 text-sm font-medium text-white">
            Ouvrir Solenn
          </Link>
          <button
            disabled={!permissions.canWrite}
            onClick={async () => {
              await actions.addSolennSessionFromDraft({
                subjectName: 'Ceremonie en cours',
                durationMinutes: 10,
                context: 'Crémation',
                tone: 'Narratif',
              });
            }}
            className="rounded-lg border border-[#13212E] px-4 py-2 text-sm font-medium text-[#13212E] disabled:opacity-50"
          >
            Ajouter entree de suivi
          </button>
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-[#D8DEE5] bg-white p-6">
        <h2 className="text-lg font-semibold">Historique redactions (MVP)</h2>
        <div className="mt-4 space-y-3">
          {state.solennSessions.map((s) => (
            <div key={s.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[#E4EAF0] p-4">
              <div>
                <p className="font-medium">{s.subjectName}</p>
                <p className="text-xs text-[#5A6B7B]">
                  {new Date(s.createdAt).toLocaleDateString('fr-FR')} - {s.durationMinutes} min - {s.context} - {s.tone}
                </p>
              </div>
              <div className="flex gap-2">
                <Link href="/solenn" className="rounded-lg border px-3 py-2 text-xs">Dupliquer</Link>
                <Link href="/pro/memoriaux" className="rounded-lg border px-3 py-2 text-xs">Associer a un memorial</Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </ProShell>
  );
}
