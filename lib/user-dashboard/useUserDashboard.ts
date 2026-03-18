'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { UserDashboardData } from '@/lib/user-dashboard/types';

const supabase = createClient();

async function getAuthHeaders(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}

const emptyData: UserDashboardData = {
  user: { id: '', email: '' },
  summary: {
    memorialCount: 0,
    draftCount: 0,
    publishedCount: 0,
    totalMessages: 0,
    totalCandles: 0,
    collaborationCount: 0,
    pendingCollaborationInvitesCount: 0,
  },
  memorials: [],
  collaborations: [],
  pendingCollaborationInvites: [],
  recentCollaborationActivity: [],
  messages: [],
  candles: [],
};

export function useUserDashboard() {
  const [data, setData] = useState<UserDashboardData>(emptyData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      const headers = await getAuthHeaders();
      if (!headers.Authorization) {
        setError('missing_session');
        setLoading(false);
        return;
      }

      const res = await fetch('/api/user-dashboard/data', { headers });
      if (!res.ok) {
        setError('unauthorized');
        setLoading(false);
        return;
      }
      const payload = await res.json();
      setData(payload);
      setError(null);
    } catch {
      setError('network');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const actions = useMemo(
    () => ({
      refresh,
      updateMessageStatus: async (id: string, status: 'approved' | 'pending' | 'flagged') => {
        const headers = await getAuthHeaders();
        if (!headers.Authorization) return;
        const res = await fetch('/api/user-dashboard/messages', {
          method: 'PATCH',
          headers: {
            ...headers,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id, status }),
        });
        if (!res.ok) throw new Error('message_status_failed');
        await refresh();
      },
      deleteMessage: async (id: string) => {
        const headers = await getAuthHeaders();
        if (!headers.Authorization) return;
        const res = await fetch('/api/user-dashboard/messages', {
          method: 'DELETE',
          headers: {
            ...headers,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id }),
        });
        if (!res.ok) throw new Error('message_delete_failed');
        await refresh();
      },
      updatePublicationStatus: async (id: string, publicationStatus: 'draft' | 'published' | 'archived') => {
        const headers = await getAuthHeaders();
        if (!headers.Authorization) return;
        const res = await fetch(`/api/user-dashboard/memorials/${id}/state`, {
          method: 'PATCH',
          headers: {
            ...headers,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ publicationStatus }),
        });
        if (!res.ok) throw new Error('publication_update_failed');
        await refresh();
      },
      unlockMemorialForTest: async (id: string) => {
        const headers = await getAuthHeaders();
        if (!headers.Authorization) return;
        const res = await fetch(`/api/user-dashboard/memorials/${id}/test-unlock`, {
          method: 'POST',
          headers,
        });
        if (!res.ok) throw new Error('test_unlock_failed');
        await refresh();
      },
    }),
    [refresh]
  );

  return { data, loading, error, actions };
}
