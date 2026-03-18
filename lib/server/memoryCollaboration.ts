import crypto from 'node:crypto';
import { resolveIdentity } from '@/lib/memorialRuntime';

export type MemoryCollaboratorRole = 'owner' | 'editor' | 'contributor' | 'viewer';
export type MemoryInviteStatus = 'pending' | 'claimed' | 'expired' | 'revoked';

const WRITER_ROLES = new Set<MemoryCollaboratorRole>(['owner', 'editor']);
const CONTRIBUTOR_ROLES = new Set<MemoryCollaboratorRole>(['owner', 'editor', 'contributor']);
const COLLABORATION_RELATION_MARKERS = [
  'memory_memberships',
  'memory_invites',
  'memory_contributions',
  'memory_activity_logs',
];

function isMissingCollaborationRelationError(error: any): boolean {
  const message = `${error?.message || ''} ${error?.details || ''} ${error?.hint || ''}`.toLowerCase();
  return (
    error?.code === '42P01' ||
    message.includes('does not exist') ||
    message.includes('could not find the table') ||
    COLLABORATION_RELATION_MARKERS.some((marker) => message.includes(marker))
  );
}

function sanitizeContributionExcerpt(value: unknown): string {
  return String(value || '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 320);
}

export function normalizeCollaboratorRole(value: unknown): MemoryCollaboratorRole {
  if (value === 'owner' || value === 'editor' || value === 'viewer') return value;
  return 'contributor';
}

export function normalizeInviteStatus(value: unknown): MemoryInviteStatus {
  if (value === 'claimed' || value === 'expired' || value === 'revoked') return value;
  return 'pending';
}

export function normalizeContributorEmail(value: unknown): string {
  return String(value || '').trim().toLowerCase();
}

export function generateInviteToken(): string {
  return crypto.randomBytes(24).toString('hex');
}

export function generateInviteAccessCode(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let output = '';
  for (let index = 0; index < 6; index += 1) {
    output += alphabet[crypto.randomInt(0, alphabet.length)];
  }
  return output;
}

export function resolveMemoryDisplayName(memory: any): string {
  const identity = resolveIdentity(memory?.data || {});
  const fullName = [identity?.prenom, identity?.nom].filter(Boolean).join(' ').trim();
  if (fullName) return fullName;
  const fallback = [memory?.firstname, memory?.lastname].filter(Boolean).join(' ').trim();
  return fallback || 'cet espace';
}

export function hasAdministrativeMemoryRole(role: MemoryCollaboratorRole | null | undefined): boolean {
  return Boolean(role && WRITER_ROLES.has(role));
}

async function isAgencyEditor(admin: any, agencyId: string | null | undefined, userId: string): Promise<boolean> {
  if (!agencyId) return false;

  const { data } = await admin
    .from('agency_users')
    .select('role')
    .eq('agency_id', agencyId)
    .eq('user_id', userId)
    .maybeSingle();

  return data?.role === 'admin' || data?.role === 'editor';
}

export async function getMemoryAccessProfile(admin: any, memoryId: string, userId: string) {
  const { data: memory, error } = await admin
    .from('memories')
    .select('id, data, firstname, lastname, user_id, owner_user_id, agency_id, slug, public_url, publication_status, created_at')
    .eq('id', memoryId)
    .single();

  if (error || !memory) return { memory: null, role: null as MemoryCollaboratorRole | null };

  if (memory.user_id === userId || memory.owner_user_id === userId) {
    return { memory, role: 'owner' as MemoryCollaboratorRole };
  }

  const { data: membership, error: membershipError } = await admin
    .from('memory_memberships')
    .select('role, status')
    .eq('memory_id', memoryId)
    .eq('user_id', userId)
    .maybeSingle();
  if (membershipError && !isMissingCollaborationRelationError(membershipError)) {
    console.error('memory membership lookup error:', membershipError);
  }

  if (membership?.status === 'active') {
    return { memory, role: normalizeCollaboratorRole(membership.role) };
  }

  if (await isAgencyEditor(admin, memory.agency_id, userId)) {
    return { memory, role: 'editor' as MemoryCollaboratorRole };
  }

  return { memory, role: null as MemoryCollaboratorRole | null };
}

export async function canAdministerMemory(admin: any, memoryId: string, userId: string): Promise<boolean> {
  const profile = await getMemoryAccessProfile(admin, memoryId, userId);
  return Boolean(profile.memory && profile.role && WRITER_ROLES.has(profile.role));
}

export async function canContributeToMemory(admin: any, memoryId: string, userId: string): Promise<boolean> {
  const profile = await getMemoryAccessProfile(admin, memoryId, userId);
  return Boolean(profile.memory && profile.role && CONTRIBUTOR_ROLES.has(profile.role));
}

export async function buildMemoryContributionPrompt(
  admin: any,
  memoryId: string
): Promise<{ contributionCount: number; promptSection: string }> {
  const response = await admin
    .from('memory_contributions')
    .select('author_name, author_email, relationship_label, content, created_at, status')
    .eq('memory_id', memoryId)
    .in('status', ['submitted', 'reviewed'])
    .order('created_at', { ascending: true })
    .limit(10);

  if (response.error) {
    if (!isMissingCollaborationRelationError(response.error)) {
      console.error('memory contributions lookup error:', response.error);
    }
    return { contributionCount: 0, promptSection: '' };
  }

  const entries = (response.data || [])
    .map((contribution: any) => {
      const content = sanitizeContributionExcerpt(contribution.content);
      if (!content) return '';

      const author = String(contribution.author_name || contribution.author_email || 'Un proche')
        .replace(/\s+/g, ' ')
        .trim();
      const relationship = String(contribution.relationship_label || '')
        .replace(/\s+/g, ' ')
        .trim();

      return `- ${author}${relationship ? ` (${relationship})` : ''}: ${content}`;
    })
    .filter(Boolean);

  if (entries.length === 0) {
    return { contributionCount: 0, promptSection: '' };
  }

  return {
    contributionCount: entries.length,
    promptSection: `\n═══════════════════════════════════════
SOUVENIRS PARTAGES PAR LES PROCHES
═══════════════════════════════════════
Tu disposes aussi de souvenirs laisses par plusieurs proches.
Integre-les avec tact quand ils enrichissent le recit, sans en faire une liste brute dans le texte final.
Si plusieurs personnes insistent sur la meme qualite, tu peux en faire une ligne de force du recit.
N'invente rien au-dela de ce qui suit.

${entries.join('\n')}`,
  };
}

export async function appendMemoryActivityLog(admin: any, payload: {
  memoryId: string;
  actorUserId?: string | null;
  actorEmail?: string | null;
  actorRole?: string | null;
  source?: string | null;
  action: string;
  targetType?: string | null;
  targetId?: string | null;
  metadata?: Record<string, unknown>;
}) {
  const response = await admin.from('memory_activity_logs').insert({
    memory_id: payload.memoryId,
    actor_user_id: payload.actorUserId || null,
    actor_email: payload.actorEmail || null,
    actor_role: payload.actorRole || null,
    source: payload.source || 'dashboard',
    action: payload.action,
    target_type: payload.targetType || null,
    target_id: payload.targetId || null,
    metadata: payload.metadata || {},
  });

  if (response.error && !isMissingCollaborationRelationError(response.error)) {
    console.error('memory activity log insert error:', response.error);
  }
}
