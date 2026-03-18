'use client';

import Link from 'next/link';
import UserDashboardShell from '@/components/user-dashboard/UserDashboardShell';
import { useUserDashboard } from '@/lib/user-dashboard/useUserDashboard';
import { createClient } from '@/lib/supabase/client';

function badgeColor(status: string): string {
  if (status === 'paid' || status === 'published' || status === 'approved') return 'bg-[#E9F8EF] text-[#167A3E]';
  if (status === 'failed' || status === 'flagged') return 'bg-[#FDEBEC] text-[#B42318]';
  return 'bg-[#FFF4E5] text-[#9A6100]';
}

function roleBadge(role?: string): string {
  if (role === 'editor') return 'bg-[#EEF4FF] text-[#0B66C3]';
  if (role === 'contributor') return 'bg-[#FFF7E6] text-[#9A6100]';
  if (role === 'viewer') return 'bg-[#F3F4F6] text-[#4B5563]';
  return 'bg-[#F5F0E8] text-[#7A4C15]';
}

function roleLabel(role?: string): string {
  if (role === 'editor') return 'Co-editeur';
  if (role === 'contributor') return 'Contributeur';
  if (role === 'viewer') return 'Lecture seule';
  return 'Proprietaire';
}

export default function EspaceMemoriauxPage() {
  const { data, loading, actions } = useUserDashboard();
  const testUnlockEnabled = process.env.NEXT_PUBLIC_ALLOW_TEST_UNLOCK === 'true';
  const supabase = createClient();

  const getAuthHeaders = async (): Promise<Record<string, string>> => {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const downloadQr = async (memoryId: string) => {
    const headers = await getAuthHeaders();
    const res = await fetch(`/api/memories/${memoryId}/qr?mode=auto`, { headers });
    if (!res.ok) {
      alert('QR indisponible pour le moment');
      return;
    }
    const payload = await res.json();
    const url = payload.downloadUrl;
    if (!url) {
      alert('QR indisponible pour le moment');
      return;
    }
    const a = document.createElement('a');
    a.href = url;
    a.download = `qr-${memoryId}.png`;
    a.click();
  };

  const copyPublicUrl = async (memoryId: string) => {
    const headers = await getAuthHeaders();
    const res = await fetch(`/api/memories/${memoryId}/qr?mode=auto`, { headers });
    if (!res.ok) {
      alert('URL indisponible pour le moment');
      return;
    }
    const payload = await res.json();
    await navigator.clipboard.writeText(payload.publicUrl || '');
    alert('URL publique copiee');
  };

  const downloadQrPdf = async (memoryId: string) => {
    const headers = await getAuthHeaders();
    const res = await fetch(`/api/generate-qr-pdf?memoryId=${encodeURIComponent(memoryId)}`, { headers });
    if (!res.ok) {
      alert('Export PDF indisponible pour le moment');
      return;
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `qr-${memoryId}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <UserDashboardShell title="Mes memoriaux" subtitle="Chargement...">
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-4 text-sm text-[#6B7280]">Chargement...</div>
      </UserDashboardShell>
    );
  }

  return (
    <UserDashboardShell title="Mes memoriaux" subtitle="Modifier, publier, partager et exporter vos espaces">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {data.memorials.map((m) => (
          <article key={m.id} className="rounded-2xl border border-[#E5E7EB] bg-white p-4">
            <h2 className="text-lg font-semibold text-[#1B2D3E]">{m.title}</h2>
            <p className="mt-1 text-xs text-[#6B7280]">Creation: {new Date(m.createdAt).toLocaleDateString('fr-FR')}</p>

            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              <span className={`rounded-full px-2 py-1 ${roleBadge(m.accessRole)}`}>Acces: {roleLabel(m.accessRole)}</span>
              <span className={`rounded-full px-2 py-1 ${badgeColor(m.paymentStatus)}`}>Paiement: {m.paymentStatus}</span>
              <span className={`rounded-full px-2 py-1 ${badgeColor(m.publicationStatus)}`}>Publication: {m.publicationStatus}</span>
            </div>

            <div className="mt-3 text-xs text-[#6B7280] space-y-1">
              <p>{m.photosCount} photos</p>
              <p>{m.messagesCount} messages</p>
              <p>{m.candlesCount} bougies</p>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <Link href={m.canAdminister ? `/dashboard/${m.id}/validate` : `/dashboard/${m.id}/text`} className="rounded-lg border px-2 py-2 text-center text-xs">
                {m.canAdminister ? 'Modifier' : 'Consulter'}
              </Link>
              <a href={m.publicUrl} target="_blank" rel="noreferrer" className="rounded-lg border px-2 py-2 text-center text-xs">Page publique</a>
              {m.canAdminister ? (
                <>
                  <button onClick={() => downloadQr(m.id)} className="rounded-lg border px-2 py-2 text-xs">Telecharger QR</button>
                  <button onClick={() => copyPublicUrl(m.id)} className="rounded-lg border px-2 py-2 text-xs">Copier URL</button>
                  <button onClick={() => downloadQrPdf(m.id)} className="rounded-lg border px-2 py-2 text-xs">Export PDF</button>
                </>
              ) : (
                <div className="col-span-2 rounded-lg border border-dashed px-3 py-3 text-[11px] text-[#6B7280]">
                  QR, publication et export restent reserves aux proprietaires et co-editeurs.
                </div>
              )}
            </div>

            {m.canAdminister ? (
              <div className="mt-3 flex gap-2">
                <button onClick={() => actions.updatePublicationStatus(m.id, 'draft')} className="rounded-lg border px-2 py-1 text-[11px]">Brouillon</button>
                <button onClick={() => actions.updatePublicationStatus(m.id, 'published')} className="rounded-lg border px-2 py-1 text-[11px]">Publier</button>
                {testUnlockEnabled && (
                  <button onClick={() => actions.unlockMemorialForTest(m.id)} className="rounded-lg border px-2 py-1 text-[11px]">
                    Deverrouiller test
                  </button>
                )}
              </div>
            ) : null}
          </article>
        ))}
      </div>
    </UserDashboardShell>
  );
}
