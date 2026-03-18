'use client';

import { FormEvent, useState } from 'react';
import ProShell from '@/components/pro/ProShell';
import { useProStore } from '@/lib/pro/store';
import { TeamRole } from '@/lib/pro/types';

export default function ProEquipePage() {
  const { state, actions, hydrated, permissions } = useProStore();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<TeamRole>('editor');
  const [error, setError] = useState('');

  if (!hydrated) {
    return (
      <ProShell title="Equipe" subtitle="Chargement...">
        <div className="rounded-2xl border border-[#D8DEE5] bg-white p-6 text-sm text-[#5A6B7B]">Chargement...</div>
      </ProShell>
    );
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim()) return;
    setError('');
    try {
      await actions.addTeamMember({ fullName: fullName.trim(), email: email.trim(), role });
      setFullName('');
      setEmail('');
      setRole('editor');
    } catch {
      setError("Ajout impossible. Le collaborateur doit deja avoir un compte.");
    }
  };

  return (
    <ProShell title="Equipe" subtitle="Gestion multi-utilisateurs: admin agence, editor, viewer, accountant">
      <section className="rounded-2xl border border-[#D8DEE5] bg-white p-6">
        <h2 className="text-lg font-semibold">Ajouter collaborateur</h2>
        {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
        <form onSubmit={onSubmit} className="mt-4 grid gap-3 md:grid-cols-4">
          <input disabled={!permissions.canAdmin} value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Nom complet" className="rounded-lg border p-2 text-sm md:col-span-1" />
          <input disabled={!permissions.canAdmin} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="rounded-lg border p-2 text-sm md:col-span-1" />
          <select disabled={!permissions.canAdmin} value={role} onChange={(e) => setRole(e.target.value as TeamRole)} className="rounded-lg border p-2 text-sm md:col-span-1">
            <option value="admin">Admin agence</option>
            <option value="editor">Editor</option>
            <option value="viewer">Viewer</option>
            <option value="accountant">Comptable</option>
          </select>
          <button disabled={!permissions.canAdmin} className="rounded-lg bg-[#13212E] px-4 py-2 text-sm font-medium text-white md:col-span-1 disabled:opacity-50">Ajouter</button>
        </form>
      </section>

      <section className="mt-6 rounded-2xl border border-[#D8DEE5] bg-white p-6">
        <h2 className="text-lg font-semibold">Utilisateurs internes</h2>
        <div className="mt-4 space-y-3">
          {state.team.map((member) => (
            <div key={member.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[#E4EAF0] p-4">
              <div>
                <p className="font-medium">{member.fullName}</p>
                <p className="text-xs text-[#5A6B7B]">{member.email}</p>
              </div>
              <div className="flex items-center gap-2">
                <select
                  disabled={!permissions.canAdmin}
                  value={member.role}
                  onChange={async (e) => {
                    await actions.updateTeamRole(member.id, e.target.value as TeamRole);
                  }}
                  className="rounded-lg border p-2 text-xs disabled:opacity-50"
                >
                  <option value="admin">Admin agence</option>
                  <option value="editor">Editor</option>
                  <option value="viewer">Viewer</option>
                  <option value="accountant">Comptable</option>
                </select>
                <button disabled={!permissions.canAdmin} onClick={async () => actions.removeTeamMember(member.id)} className="rounded-lg border px-3 py-2 text-xs disabled:opacity-50">Supprimer</button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </ProShell>
  );
}
