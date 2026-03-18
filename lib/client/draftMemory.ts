'use client';

import { STORAGE_KEYS } from '@/lib/creationFlowStorage';
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

export function getDraftAccessTokenStorageKey(memoryId: string): string {
  return `draftAccessToken:${memoryId}`;
}

export function readDraftAccessToken(memoryId: string): string {
  if (typeof window === 'undefined' || !memoryId) return '';
  return localStorage.getItem(getDraftAccessTokenStorageKey(memoryId)) || '';
}

export type EnsureDraftMemoryInput = {
  memoryId: string;
  context?: string | null;
  communType?: string | null;
  questionnaire?: unknown;
  finalization?: unknown;
  media?: unknown;
};

export async function ensureDraftMemory(input: EnsureDraftMemoryInput): Promise<{
  memoryId: string;
  draftToken: string;
}> {
  const { data } = await supabase.auth.getSession();
  const authToken = data.session?.access_token;

  const response = await fetch('/api/draft-memories/ensure', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    },
    body: JSON.stringify(input),
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(payload?.error || 'Impossible de preparer ce brouillon');
  }

  const memoryId = String(payload?.memoryId || input.memoryId || '').trim();
  const draftToken = String(payload?.draftToken || '').trim();

  if (!memoryId || !draftToken) {
    throw new Error('Brouillon incomplet');
  }

  localStorage.setItem(STORAGE_KEYS.currentMemorialId, memoryId);
  localStorage.setItem(getDraftAccessTokenStorageKey(memoryId), draftToken);

  return { memoryId, draftToken };
}
