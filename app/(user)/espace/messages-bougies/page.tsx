'use client';

import UserDashboardShell from '@/components/user-dashboard/UserDashboardShell';
import { useUserDashboard } from '@/lib/user-dashboard/useUserDashboard';

function badge(status: 'approved' | 'pending' | 'flagged') {
  if (status === 'approved') return 'bg-[#E9F8EF] text-[#167A3E]';
  if (status === 'flagged') return 'bg-[#FDEBEC] text-[#B42318]';
  return 'bg-[#FFF4E5] text-[#9A6100]';
}

export default function EspaceMessagesBougiesPage() {
  const { data, loading, actions } = useUserDashboard();

  if (loading) {
    return (
      <UserDashboardShell title="Messages & bougies" subtitle="Chargement...">
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-4 text-sm text-[#6B7280]">Chargement...</div>
      </UserDashboardShell>
    );
  }

  return (
    <UserDashboardShell title="Messages & bougies" subtitle="Moderation simple et suivi des hommages">
      <section className="rounded-2xl border border-[#E5E7EB] bg-white p-5">
        <h2 className="text-lg font-semibold">Messages recus</h2>
        <div className="mt-4 space-y-3">
          {data.messages.map((msg) => (
            <div key={msg.id} className="rounded-xl border border-[#EEF2F7] p-4">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium">{msg.memoryTitle}</p>
                <span className={`rounded-full px-2 py-1 text-xs ${badge(msg.status)}`}>{msg.status}</span>
              </div>
              <p className="mt-1 text-xs text-[#6B7280]">{msg.authorName} • {new Date(msg.createdAt).toLocaleDateString('fr-FR')}</p>
              <p className="mt-2 text-sm text-[#334155]">{msg.content}</p>
              {msg.canModerate ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  <button onClick={() => actions.updateMessageStatus(msg.id, 'approved')} className="rounded-lg border px-2 py-1 text-xs">Approuver</button>
                  <button onClick={() => actions.updateMessageStatus(msg.id, 'pending')} className="rounded-lg border px-2 py-1 text-xs">En attente</button>
                  <button onClick={() => actions.updateMessageStatus(msg.id, 'flagged')} className="rounded-lg border px-2 py-1 text-xs">Signaler</button>
                  <button onClick={() => actions.deleteMessage(msg.id)} className="rounded-lg border px-2 py-1 text-xs">Supprimer</button>
                </div>
              ) : (
                <p className="mt-3 text-xs text-[#6B7280]">
                  Cet espace est partage avec vous en lecture ou contribution: la moderation reste reservee aux proprietaires et co-editeurs.
                </p>
              )}
            </div>
          ))}
          {data.messages.length === 0 ? <p className="text-sm text-[#6B7280]">Aucun message recu.</p> : null}
        </div>
      </section>

      <section className="mt-5 rounded-2xl border border-[#E5E7EB] bg-white p-5">
        <h2 className="text-lg font-semibold">Bougies</h2>
        <p className="mt-1 text-sm text-[#6B7280]">Total: {data.summary.totalCandles}</p>
        <div className="mt-4 space-y-2">
          {data.candles.map((candle) => (
            <div key={candle.id} className="rounded-lg border border-[#EEF2F7] px-3 py-2 text-sm">
              {candle.memoryTitle} • {candle.authorName} • {new Date(candle.createdAt).toLocaleDateString('fr-FR')}
            </div>
          ))}
          {data.candles.length === 0 ? <p className="text-sm text-[#6B7280]">Aucune bougie pour le moment.</p> : null}
        </div>
      </section>
    </UserDashboardShell>
  );
}
