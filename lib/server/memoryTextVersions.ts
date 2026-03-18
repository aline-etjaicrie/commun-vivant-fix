const TEXT_VERSION_RELATION_MARKERS = ['memory_text_versions'];

function isMissingTextVersionRelationError(error: any): boolean {
  const message = `${error?.message || ''} ${error?.details || ''} ${error?.hint || ''}`.toLowerCase();
  return (
    error?.code === '42P01' ||
    message.includes('does not exist') ||
    message.includes('could not find the table') ||
    TEXT_VERSION_RELATION_MARKERS.some((marker) => message.includes(marker))
  );
}

function collapseWhitespace(value: unknown): string {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function stripHtml(value: string): string {
  return value
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

export type MemoryTextVersionPayload = {
  memoryId: string;
  createdByUserId?: string | null;
  createdByEmail?: string | null;
  actorRole?: string | null;
  source?: string | null;
  versionKind: string;
  style?: string | null;
  contentText?: string | null;
  contentHtml?: string | null;
  metadata?: Record<string, unknown>;
};

export async function appendMemoryTextVersion(admin: any, payload: MemoryTextVersionPayload) {
  const contentText = collapseWhitespace(payload.contentText);
  const contentHtml = String(payload.contentHtml || '').trim();
  const fallbackText = contentText || stripHtml(contentHtml);

  if (!payload.memoryId || (!fallbackText && !contentHtml)) {
    return;
  }

  const response = await admin.from('memory_text_versions').insert({
    memory_id: payload.memoryId,
    created_by_user_id: payload.createdByUserId || null,
    created_by_email: payload.createdByEmail || null,
    actor_role: payload.actorRole || null,
    source: payload.source || 'dashboard',
    version_kind: payload.versionKind,
    style: payload.style || null,
    content_text: fallbackText || null,
    content_html: contentHtml || null,
    metadata: payload.metadata || {},
  });

  if (response.error && !isMissingTextVersionRelationError(response.error)) {
    console.error('memory text version insert error:', response.error);
  }
}

export async function listMemoryTextVersions(admin: any, memoryId: string, limit = 12) {
  const response = await admin
    .from('memory_text_versions')
    .select('id, version_kind, source, style, content_text, content_html, created_by_email, actor_role, metadata, created_at')
    .eq('memory_id', memoryId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (response.error) {
    if (!isMissingTextVersionRelationError(response.error)) {
      console.error('memory text versions lookup error:', response.error);
    }
    return [];
  }

  return (response.data || []).map((row: any) => {
    const text = collapseWhitespace(row.content_text || stripHtml(String(row.content_html || '')));
    return {
      id: row.id,
      versionKind: String(row.version_kind || 'snapshot'),
      source: String(row.source || 'dashboard'),
      style: row.style || null,
      actorEmail: row.created_by_email || null,
      actorRole: row.actor_role || null,
      excerpt: text.slice(0, 220),
      createdAt: row.created_at,
      metadata: row.metadata || {},
    };
  });
}
