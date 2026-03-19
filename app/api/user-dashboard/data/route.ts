import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/app/api/user-dashboard/_shared';
import { resolveCommunTypeFromContext, type CommunType } from '@/lib/communTypes';
import {
  resolveCompositionModel,
  resolveVisualTheme,
  resolveWritingStyle,
} from '@/lib/compositionStudio';
import { resolveTypographyPreference, type TributeDisplayMode } from '@/lib/memorialRuntime';
import { normalizePaymentStatus } from '@/lib/paymentStatus';
import { buildB2CPath, normalizePublicUrlOrPath } from '@/lib/publicUrls';
import {
  hasAdministrativeMemoryRole,
  normalizeCollaboratorRole,
  resolveMemoryDisplayName,
} from '@/lib/server/memoryCollaboration';
import { getSupabaseAdmin } from '@/lib/server/supabaseAdmin';

export const runtime = 'nodejs';


function isMissingCollaborationRelationError(error: any): boolean {
  const message = `${error?.message || ''} ${error?.details || ''} ${error?.hint || ''}`.toLowerCase();
  return (
    error?.code === '42P01' ||
    message.includes('does not exist') ||
    message.includes('memory_memberships') ||
    message.includes('memory_invites') ||
    message.includes('memory_activity_logs')
  );
}

function normalizePublicationStatus(value?: string | null): 'draft' | 'published' | 'archived' {
  if (value === 'published') return 'published';
  if (value === 'archived') return 'archived';
  return 'draft';
}

function normalizeGenerationStatus(value?: string | null): 'not_started' | 'generated' | 'edited' {
  if (value === 'generated') return 'generated';
  if (value === 'edited') return 'edited';
  return 'not_started';
}

function normalizeTributeMode(value?: string | null): TributeDisplayMode {
  if (value === 'candle' || value === 'flower' || value === 'none') return value;
  return 'both';
}

export async function GET(request: NextRequest) {
  try {
    const { supabase, user } = await getAuthenticatedUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const admin = getSupabaseAdmin();

    let ownedMemoriesRows: any[] = [];
    const withSlug = await supabase
      .from('memories')
      .select('id, slug, public_url, agency_id, created_at, data, template_choice, formula, payment_status, publication_status, generation_status, expires_at, image_themes, memory_image_energies, context_type')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(200);

    const memoriesError = withSlug.error;
    if (!withSlug.error && withSlug.data) {
      ownedMemoriesRows = withSlug.data;
    } else {
      const fallback = await supabase
        .from('memories')
        .select('id, created_at, data, template_choice, formula, payment_status, publication_status, generation_status, expires_at, image_themes, memory_image_energies, context_type')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(200);
      ownedMemoriesRows = fallback.data || [];
    }

    if (memoriesError) {
      console.error('USER DASH memories error:', memoriesError);
      return NextResponse.json({ error: 'Unable to load memories' }, { status: 500 });
    }

    let collaborations: any[] = [];
    let pendingCollaborationInvites: any[] = [];
    let recentCollaborationActivity: any[] = [];
    const visibleMemoryRows = (ownedMemoriesRows || []).map((row: any) => ({
      ...row,
      access_role: 'owner',
      is_owned: true,
    }));

    const membershipsResponse = await admin
      .from('memory_memberships')
      .select('memory_id, role, joined_at, last_seen_at')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .neq('role', 'owner')
      .order('joined_at', { ascending: false })
      .limit(50);

    if (!membershipsResponse.error) {
      const membershipRows = membershipsResponse.data || [];
      const collaborationIds = membershipRows.map((row: any) => row.memory_id).filter(Boolean);

      if (collaborationIds.length > 0) {
        const memoryResponse = await admin
          .from('memories')
          .select('id, slug, public_url, publication_status, created_at, data, firstname, lastname, agency_id, formula, payment_status, generation_status, expires_at, image_themes, memory_image_energies, context_type')
          .in('id', collaborationIds)
          .limit(100);

        const collaborationMemoryById = new Map<string, any>(
          (memoryResponse.data || []).map((row: any) => [row.id, row])
        );

        collaborations = membershipRows
          .map((membership: any) => {
            const memory = collaborationMemoryById.get(membership.memory_id);
            if (!memory) return null;

            const role = normalizeCollaboratorRole(membership.role);
            if (!visibleMemoryRows.some((row: any) => row.id === memory.id)) {
              visibleMemoryRows.push({
                ...memory,
                access_role: role,
                is_owned: false,
              });
            }

            return {
              id: memory.id,
              title: resolveMemoryDisplayName(memory),
              role,
              joinedAt: membership.joined_at,
              lastSeenAt: membership.last_seen_at,
              publicationStatus: normalizePublicationStatus(memory.publication_status),
              publicUrl: normalizePublicUrlOrPath(
                memory.public_url,
                buildB2CPath(memory.slug || memory.id)
              ),
            };
          })
          .filter(Boolean);

        const activityResponse = await admin
          .from('memory_activity_logs')
          .select('id, memory_id, actor_email, actor_role, action, source, metadata, created_at')
          .in('memory_id', collaborationIds)
          .order('created_at', { ascending: false })
          .limit(20);

        if (!activityResponse.error) {
          recentCollaborationActivity = (activityResponse.data || []).map((entry: any) => ({
            id: entry.id,
            memoryId: entry.memory_id,
            memoryTitle:
              collaborations.find((memory: any) => memory.id === entry.memory_id)?.title || 'Espace partage',
            actorEmail: entry.actor_email || null,
            actorRole: entry.actor_role || null,
            action: entry.action || 'updated',
            source: entry.source || 'dashboard',
            metadata: entry.metadata || {},
            createdAt: entry.created_at,
          }));
        }
      }

      if (user.email) {
        const pendingInviteResponse = await admin
          .from('memory_invites')
          .select('id, memory_id, role, status, expires_at, created_at')
          .eq('email', String(user.email || '').trim().toLowerCase())
          .eq('status', 'pending')
          .order('created_at', { ascending: false })
          .limit(20);

        if (!pendingInviteResponse.error) {
          const pendingInviteIds = (pendingInviteResponse.data || []).map((invite: any) => invite.memory_id);
          const pendingMemoriesResponse = pendingInviteIds.length
            ? await admin
                .from('memories')
                .select('id, data, firstname, lastname')
                .in('id', pendingInviteIds)
            : { data: [] as any[] };
          const pendingMemoryById = new Map<string, any>(
            (pendingMemoriesResponse.data || []).map((row: any) => [row.id, row])
          );

          pendingCollaborationInvites = (pendingInviteResponse.data || []).map((invite: any) => ({
            id: invite.id,
            memoryId: invite.memory_id,
            title: resolveMemoryDisplayName(pendingMemoryById.get(invite.memory_id) || {}),
            role: normalizeCollaboratorRole(invite.role),
            expiresAt: invite.expires_at,
            createdAt: invite.created_at,
          }));
        }
      }
    } else if (!isMissingCollaborationRelationError(membershipsResponse.error)) {
      console.error('USER DASH collaboration memberships error:', membershipsResponse.error);
    }

    const memories = [...visibleMemoryRows].sort((left: any, right: any) =>
      String(right.created_at || '').localeCompare(String(left.created_at || ''))
    );
    const memoryIds = memories.map((m: any) => m.id);

    let mediaRows: any[] = [];
    if (memoryIds.length > 0) {
      const { data } = await supabase
        .from('memory_media')
        .select('id, memory_id, type')
        .in('memory_id', memoryIds)
        .limit(1000);
      mediaRows = data || [];
    }

    let messageRows: any[] = [];
    if (memoryIds.length > 0) {
      const primary = await supabase
        .from('memory_messages')
        .select('id, memory_id, author_name, content, created_at, approved, flagged, status')
        .in('memory_id', memoryIds)
        .order('created_at', { ascending: false })
        .limit(500);

      if (!primary.error && primary.data) {
        messageRows = primary.data;
      } else {
        const fallback = await supabase
          .from('messages')
          .select('id, memory_id, author_name, content, created_at, approved, flagged, status')
          .in('memory_id', memoryIds)
          .order('created_at', { ascending: false })
          .limit(500);
        messageRows = fallback.data || [];
      }
    }

    let candleRows: any[] = [];
    if (memoryIds.length > 0) {
      const { data } = await supabase
        .from('memory_candles')
        .select('id, memory_id, author_name, created_at')
        .in('memory_id', memoryIds)
        .order('created_at', { ascending: false })
        .limit(500);
      candleRows = data || [];
    }

    const mediaByMemory = mediaRows.reduce((acc: Record<string, any[]>, row: any) => {
      if (!acc[row.memory_id]) acc[row.memory_id] = [];
      acc[row.memory_id].push(row);
      return acc;
    }, {});

    const messagesByMemory = messageRows.reduce((acc: Record<string, any[]>, row: any) => {
      if (!acc[row.memory_id]) acc[row.memory_id] = [];
      acc[row.memory_id].push(row);
      return acc;
    }, {});

    const candlesByMemory = candleRows.reduce((acc: Record<string, any[]>, row: any) => {
      if (!acc[row.memory_id]) acc[row.memory_id] = [];
      acc[row.memory_id].push(row);
      return acc;
    }, {});

    const memorials = memories.map((row: any) => {
      const payload = row.data || {};
      const identite = payload.identite || payload.defunt || {};
      const subjectFirstName = identite.prenom || payload.prenom || '';
      const subjectLastName = identite.nom || payload.nom || '';
      const title = [subjectFirstName, subjectLastName].filter(Boolean).join(' ').trim() || 'Mémorial';

      const relatedMedia = mediaByMemory[row.id] || [];
      const relatedMessages = messagesByMemory[row.id] || [];
      const relatedCandles = candlesByMemory[row.id] || [];

      const photoCount = relatedMedia.filter((item: any) => item.type === 'image' || !item.type).length;
      const pendingMessagesCount = relatedMessages.filter((msg: any) => msg.flagged || !msg.approved).length;

      const communType = payload?.communType
        ? String(payload.communType)
        : resolveCommunTypeFromContext(row.context_type || '');
      const resolvedCommunType = communType as CommunType;
      const accessRole = normalizeCollaboratorRole(row.access_role || 'owner');
      const canAdminister = hasAdministrativeMemoryRole(accessRole);
      const audioTitle = payload?.medias?.audioTitle || payload?.gouts?.musique || null;
      const visualTheme = resolveVisualTheme(payload?.visualTheme || payload?.template, resolvedCommunType);
      const compositionModel = resolveCompositionModel(payload?.compositionModel || payload?.layout, resolvedCommunType);
      const writingStyle = resolveWritingStyle(payload?.writingStyle || payload?.style, resolvedCommunType);

      return {
        id: row.id,
        title,
        communType: resolvedCommunType,
        subjectFirstName,
        subjectLastName,
        profilePhotoUrl: payload?.identite?.photoUrl || null,
        accessRole,
        canAdminister,
        isOwned: Boolean(row.is_owned),
        createdAt: row.created_at,
        paymentStatus: normalizePaymentStatus(row.payment_status),
        publicationStatus: normalizePublicationStatus(row.publication_status),
        generationStatus: normalizeGenerationStatus(row.generation_status),
        formula: row.formula || 'Essentiel',
        expiresAt: row.expires_at || null,
        photosCount: photoCount,
        messagesCount: relatedMessages.length,
        candlesCount: relatedCandles.length,
        pendingMessagesCount,
        publicUrl: normalizePublicUrlOrPath(
          row.public_url,
          buildB2CPath(row.slug || row.id)
        ),
        imageThemes: Array.isArray(row.image_themes)
          ? row.image_themes
          : Array.isArray(row.memory_image_energies)
          ? row.memory_image_energies
          : [],
        compositionModel,
        visualTheme,
        writingStyle,
        textTypography: resolveTypographyPreference(payload?.textTypography),
        tributeMode: normalizeTributeMode(payload?.tributeMode),
        audioTitle,
        audioEnabled: Boolean(audioTitle),
      };
    });

    const totalMessages = memorials.reduce((acc: number, curr: any) => acc + curr.messagesCount, 0);
    const totalCandles = memorials.reduce((acc: number, curr: any) => acc + curr.candlesCount, 0);
    const memoryAccessMap = memorials.reduce((acc: Record<string, { role: string; canAdminister: boolean }>, memorial: any) => {
      acc[memorial.id] = {
        role: memorial.accessRole,
        canAdminister: Boolean(memorial.canAdminister),
      };
      return acc;
    }, {});

    const memoryTitleMap = memorials.reduce((acc: Record<string, string>, m: any) => {
      acc[m.id] = m.title;
      return acc;
    }, {});

    const messages = messageRows.slice(0, 80).map((msg: any) => ({
      id: msg.id,
      memoryId: msg.memory_id,
      memoryTitle: memoryTitleMap[msg.memory_id] || 'Mémorial',
      authorName: msg.author_name || 'Proche',
      content: msg.content || '',
      createdAt: msg.created_at,
      status: msg.flagged ? 'flagged' : msg.approved ? 'approved' : 'pending',
      accessRole: memoryAccessMap[msg.memory_id]?.role || 'owner',
      canModerate: Boolean(memoryAccessMap[msg.memory_id]?.canAdminister),
    }));

    const candles = candleRows.slice(0, 80).map((candle: any) => ({
      id: candle.id,
      memoryId: candle.memory_id,
      memoryTitle: memoryTitleMap[candle.memory_id] || 'Mémorial',
      authorName: candle.author_name || 'Visiteur',
      createdAt: candle.created_at,
    }));

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email || '',
        name: user.user_metadata?.name || '',
        createdAt: user.created_at || null,
      },
      summary: {
        memorialCount: ownedMemoriesRows.length,
        draftCount: memorials.filter((m: any) => m.isOwned && m.publicationStatus === 'draft').length,
        publishedCount: memorials.filter((m: any) => m.isOwned && m.publicationStatus === 'published').length,
        totalMessages,
        totalCandles,
        collaborationCount: collaborations.length,
        pendingCollaborationInvitesCount: pendingCollaborationInvites.length,
      },
      memorials,
      collaborations,
      pendingCollaborationInvites,
      recentCollaborationActivity,
      messages,
      candles,
    });
  } catch (error) {
    console.error('USER DASH data error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
