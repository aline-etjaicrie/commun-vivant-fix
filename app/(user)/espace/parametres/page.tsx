'use client';

import { useState } from 'react';
import UserDashboardShell from '@/components/user-dashboard/UserDashboardShell';
import { useUserDashboard } from '@/lib/user-dashboard/useUserDashboard';
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

export default function EspaceParametresPage() {
  const { data, loading } = useUserDashboard();
  const [feedback, setFeedback] = useState('');

  if (loading) {
    return (
      <UserDashboardShell title="Parametres" subtitle="Chargement...">
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-4 text-sm text-[#6B7280]">Chargement...</div>
      </UserDashboardShell>
    );
  }

  const triggerResetPassword = async () => {
    const email = data.user.email;
    if (!email) return;
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback`,
    });
    setFeedback(error ? 'Erreur envoi email reset.' : 'Email de reinitialisation envoye.');
  };

  return (
    <UserDashboardShell title="Parametres" subtitle="Compte, securite et droits RGPD">
      <section className="rounded-2xl border border-[#E5E7EB] bg-white p-5">
        <h2 className="text-lg font-semibold">Informations utilisateur</h2>
        <p className="mt-2 text-sm text-[#334155]">Email: {data.user.email}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button onClick={triggerResetPassword} className="rounded-lg border px-3 py-2 text-sm">Changer le mot de passe</button>
          <button className="rounded-lg border px-3 py-2 text-sm">Exporter mes donnees (RGPD)</button>
          <button className="rounded-lg border px-3 py-2 text-sm">Supprimer mon compte</button>
        </div>
        {feedback ? <p className="mt-3 text-sm text-[#6B7280]">{feedback}</p> : null}
      </section>
    </UserDashboardShell>
  );
}
