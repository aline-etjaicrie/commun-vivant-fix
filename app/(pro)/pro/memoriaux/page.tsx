'use client';

import Link from 'next/link';
import ProShell from '@/components/pro/ProShell';
import { useProStore } from '@/lib/pro/store';
import { createClient } from '@/lib/supabase/client';

export default function ProMemoriauxPage() {
  const { state, actions, hydrated, permissions } = useProStore();
  const testUnlockEnabled = process.env.NEXT_PUBLIC_ALLOW_TEST_UNLOCK === 'true';
  const supabase = createClient();

  const getAuthHeaders = async (): Promise<Record<string, string>> => {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const copyPublicUrl = async (id: string) => {
    const headers = await getAuthHeaders();
    const res = await fetch(`/api/memories/${id}/qr?mode=b2b`, { headers });
    if (!res.ok) {
      alert('URL indisponible pour le moment');
      return;
    }
    const payload = await res.json();
    await navigator.clipboard.writeText(payload.publicUrl || '');
    alert('URL publique copiée');
  };

  const downloadQr = async (id: string) => {
    const headers = await getAuthHeaders();
    const res = await fetch(`/api/memories/${id}/qr?mode=b2b`, { headers });
    if (!res.ok) {
      alert('QR indisponible pour le moment');
      return;
    }
    const payload = await res.json();
    if (!payload.downloadUrl) {
      alert('QR indisponible pour le moment');
      return;
    }
    const a = document.createElement('a');
    a.href = payload.downloadUrl;
    a.download = `qr-${id}.png`;
    a.click();
  };

  if (!hydrated) {
    return (
      <ProShell title="Memoriaux" subtitle="Chargement...">
        <div className="rounded-2xl border border-[#D8DEE5] bg-white p-6 text-sm text-[#5A6B7B]">Chargement...</div>
      </ProShell>
    );
  }

  return (
    <ProShell
      title="Memoriaux"
      subtitle="Creation et gestion des memorials numeriques vendus aux familles"
    >
      <section className="rounded-2xl border border-[#D8DEE5] bg-white p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">Liste des memorials</h2>
          <div className="flex flex-wrap gap-2">
            <Link href="/create?communType=deces&context=funeral" className="rounded-lg bg-[#13212E] px-3 py-2 text-sm text-white">
              Creer un nouveau memorial
            </Link>
          </div>
        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead>
              <tr className="border-b border-[#E4EAF0] text-xs uppercase tracking-wide text-[#6B7A89]">
                <th className="py-2">Famille</th>
                <th className="py-2">Memorial</th>
                <th className="py-2">Paiement</th>
                <th className="py-2">Lien public</th>
                <th className="py-2">Commission</th>
                <th className="py-2">Acces</th>
                <th className="py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {state.memorials.map((m) => (
                <tr key={m.id} className="border-b border-[#F0F3F6]">
                  <td className="py-3 font-medium">{m.familyName}</td>
                  <td className="py-3">{m.subjectName}</td>
                  <td className="py-3">
                    <span className={`rounded-full px-2 py-1 text-xs ${m.paymentStatus === 'paid' ? 'bg-[#E9F8EF] text-[#167A3E]' : 'bg-[#FFF4E5] text-[#9A6100]'}`}>
                      {m.paymentStatus === 'paid' ? 'Paye' : 'En attente'}
                    </span>
                  </td>
                  <td className="py-3">
                    <a className="text-[#0B66C3] underline" href={m.publicUrl} target="_blank" rel="noreferrer">
                      Ouvrir
                    </a>
                  </td>
                  <td className="py-3">{m.agencyCommission} EUR</td>
                  <td className="py-3">
                    <span className={`rounded-full px-2 py-1 text-xs ${m.accessStatus === 'suspended' ? 'bg-[#FDEBEC] text-[#B42318]' : 'bg-[#E9F8EF] text-[#167A3E]'}`}>
                      {m.accessStatus === 'suspended' ? 'Suspendu' : 'Actif'}
                    </span>
                  </td>
                  <td className="py-3">
                    <div className="flex flex-wrap gap-2">
                      <button
                        disabled={!permissions.canWrite}
                        onClick={() => actions.setMemorialAccess(m.id, 'active')}
                        className="rounded-lg border px-2 py-1 text-xs disabled:opacity-50"
                      >
                        Activer
                      </button>
                      <button
                        disabled={!permissions.canWrite}
                        onClick={() => actions.setMemorialAccess(m.id, 'suspended', 'Suspendu depuis dashboard agence')}
                        className="rounded-lg border px-2 py-1 text-xs disabled:opacity-50"
                      >
                        Suspendre
                      </button>
                      <button onClick={() => downloadQr(m.id)} className="rounded-lg border px-2 py-1 text-xs">QR Code</button>
                      <button onClick={() => copyPublicUrl(m.id)} className="rounded-lg border px-2 py-1 text-xs">Copier URL</button>
                      <button className="rounded-lg border px-2 py-1 text-xs">Dupliquer</button>
                      {testUnlockEnabled && (
                        <button
                          disabled={!permissions.canWrite}
                          onClick={() => actions.unlockMemorialForTest(m.id)}
                          className="rounded-lg border px-2 py-1 text-xs disabled:opacity-50"
                        >
                          Deverrouiller test
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </ProShell>
  );
}
