'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { ProDashboardState, TeamRole } from '@/lib/pro/types';

const supabase = createClient();

const emptyState: ProDashboardState = {
  agency: {
    id: '',
    name: '',
    subscriptionType: 'pro',
    subscriptionPrice: 490,
    subscriptionRenewalDate: new Date().toISOString(),
    agencyCredit: 0,
    commissionRate: 20,
    createdAt: new Date().toISOString(),
  },
  memorials: [],
  solennSessions: [],
  team: [],
  branding: {
    level: 'pro',
    displayName: '',
    partnerMention: 'En partenariat avec Commun Vivant',
  },
  billingDocuments: [],
};

async function getAuthHeaders(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}

export function useProStore() {
  const [state, setState] = useState<ProDashboardState>(emptyState);
  const [hydrated, setHydrated] = useState(false);
  const [role, setRole] = useState<'admin' | 'editor' | 'viewer' | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const headers = await getAuthHeaders();
      if (!headers.Authorization) {
        setAuthError('missing_session');
        setHydrated(true);
        return;
      }

      const res = await fetch('/api/pro/dashboard', { headers });
      if (!res.ok) {
        setAuthError('unauthorized');
        setHydrated(true);
        return;
      }

      const data = await res.json();
      setRole(data.role || null);
      setState({
        agency: data.agency,
        memorials: data.memorials || [],
        solennSessions: data.solennSessions || [],
        team: data.team || [],
        branding: data.branding || emptyState.branding,
        billingDocuments: data.billingDocuments || [],
      });
      setAuthError(null);
    } catch {
      setAuthError('network');
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const patchAgency = useCallback(
    async (payload: Record<string, any>) => {
      const headers = await getAuthHeaders();
      if (!headers.Authorization) return;

      const res = await fetch('/api/pro/agency', {
        method: 'PATCH',
        headers: {
          ...headers,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('agency_update_failed');
      await refresh();
    },
    [refresh]
  );

  const actions = useMemo(
    () => ({
      refresh,
      setSubscriptionType: async (subscriptionType: 'base' | 'pro' | 'premium', subscriptionPrice: number) => {
        await patchAgency({ subscriptionType, subscriptionPrice });
      },
      setAgencyInfo: async (payload: Partial<ProDashboardState['agency']>) => {
        await patchAgency(payload);
      },
      addTeamMember: async (member: { fullName: string; email: string; role: TeamRole }) => {
        const headers = await getAuthHeaders();
        if (!headers.Authorization) return;
        const res = await fetch('/api/pro/team', {
          method: 'POST',
          headers: {
            ...headers,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: member.email,
            role: member.role,
          }),
        });
        if (!res.ok) throw new Error('team_add_failed');
        await refresh();
      },
      removeTeamMember: async (id: string) => {
        const headers = await getAuthHeaders();
        if (!headers.Authorization) return;
        const res = await fetch('/api/pro/team', {
          method: 'DELETE',
          headers: {
            ...headers,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ memberId: id }),
        });
        if (!res.ok) throw new Error('team_remove_failed');
        await refresh();
      },
      updateTeamRole: async (id: string, role: TeamRole) => {
        const headers = await getAuthHeaders();
        if (!headers.Authorization) return;
        const res = await fetch('/api/pro/team', {
          method: 'PATCH',
          headers: {
            ...headers,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ memberId: id, role }),
        });
        if (!res.ok) throw new Error('team_role_failed');
        await refresh();
      },
      updateBranding: async (payload: Partial<ProDashboardState['branding']>) => {
        await patchAgency(payload);
      },
      setMemorialAccess: async (id: string, accessStatus: 'active' | 'suspended', suspensionReason?: string) => {
        const headers = await getAuthHeaders();
        if (!headers.Authorization) return;
        const res = await fetch(`/api/pro/memorials/${id}/access`, {
          method: 'PATCH',
          headers: {
            ...headers,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ accessStatus, suspensionReason }),
        });
        if (!res.ok) throw new Error('memorial_access_failed');
        await refresh();
      },
      unlockMemorialForTest: async (id: string) => {
        const headers = await getAuthHeaders();
        if (!headers.Authorization) return;
        const res = await fetch(`/api/pro/memorials/${id}/test-unlock`, {
          method: 'POST',
          headers,
        });
        if (!res.ok) throw new Error('memorial_test_unlock_failed');
        await refresh();
      },
      addSolennSessionFromDraft: async (payload: {
        subjectName: string;
        durationMinutes: 5 | 10 | 15;
        context: 'Crémation' | 'Inhumation' | 'Cérémonie intime';
        tone: 'Sobre' | 'Narratif' | 'Chaleureux';
      }) => {
        const headers = await getAuthHeaders();
        if (!headers.Authorization) return;

        await fetch('/api/solenn/documents', {
          method: 'POST',
          headers: {
            ...headers,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: payload.subjectName,
            duration: String(payload.durationMinutes),
            context: payload.context,
            tone: payload.tone,
            blocks: {
              identite: payload.subjectName,
              caractere: '',
              passions: '',
              lieux: '',
              sensibilite: '',
              humour: '',
              proches: '',
              messageFinal: '',
            },
            text: '',
            regenerationCount: 0,
          }),
        });

        await refresh();
      },
      addMemorialLead: async () => {
        // Intentional no-op in cloud mode: memorial creation uses the dedicated /create flow.
      },
    }),
    [patchAgency, refresh]
  );

  const permissions = useMemo(
    () => ({
      role,
      canWrite: role === 'admin' || role === 'editor',
      canAdmin: role === 'admin',
      authError,
    }),
    [authError, role]
  );

  return { state, actions, hydrated, permissions };
}
