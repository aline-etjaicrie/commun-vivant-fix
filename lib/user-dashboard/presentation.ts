import type { UserDashboardData, UserMemorialItem } from '@/lib/user-dashboard/types';
import { getValidateUrl } from '@/lib/validateUrl';

export type DashboardAction = {
  id: string;
  label: string;
  description: string;
  href: string;
  external?: boolean;
  primary?: boolean;
};

export type DashboardActivityItem = {
  id: string;
  type: 'message' | 'candle' | 'collaboration';
  title: string;
  description: string;
  href: string;
  createdAt: string;
};

export function formatRelativeDate(value?: string | null): string {
  if (!value) return 'À l’instant';

  const target = new Date(value).getTime();
  if (Number.isNaN(target)) return 'Récemment';

  const diffMs = target - Date.now();
  const diffMinutes = Math.round(diffMs / 60000);
  const rtf = new Intl.RelativeTimeFormat('fr-FR', { numeric: 'auto' });

  if (Math.abs(diffMinutes) < 60) return rtf.format(diffMinutes, 'minute');

  const diffHours = Math.round(diffMinutes / 60);
  if (Math.abs(diffHours) < 24) return rtf.format(diffHours, 'hour');

  const diffDays = Math.round(diffHours / 24);
  if (Math.abs(diffDays) < 7) return rtf.format(diffDays, 'day');

  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'short',
  }).format(new Date(target));
}

export function selectDashboardFocusMemorial(memorials: UserMemorialItem[]): UserMemorialItem | null {
  if (memorials.length === 0) return null;

  const sorted = [...memorials].sort((left, right) => {
    const rightScore = getMemorialMomentumScore(right);
    const leftScore = getMemorialMomentumScore(left);

    if (rightScore !== leftScore) return rightScore - leftScore;
    return String(right.createdAt || '').localeCompare(String(left.createdAt || ''));
  });

  return sorted[0] || null;
}

export function getMemorialStage(memorial: UserMemorialItem) {
  if (memorial.publicationStatus === 'published') {
    return {
      label: 'Publié',
      description: 'Votre espace est visible et peut continuer à recevoir des contributions.',
      tone: 'published' as const,
    };
  }

  if (memorial.generationStatus === 'edited') {
    return {
      label: 'Prêt à publier',
      description: 'Le texte et la composition sont avancés. Une dernière relecture suffit.',
      tone: 'ready' as const,
    };
  }

  if (memorial.generationStatus === 'generated') {
    return {
      label: 'Texte à relire',
      description: 'Une première version existe. Vous pouvez maintenant l’ajuster et choisir le rendu.',
      tone: 'progress' as const,
    };
  }

  return {
    label: 'Brouillon en cours',
    description: 'Le projet est amorcé, mais il reste encore à lui donner sa forme finale.',
    tone: 'draft' as const,
  };
}

export function getPrimaryDashboardAction(memorial: UserMemorialItem): DashboardAction {
  if (memorial.publicationStatus === 'published') {
    return {
      id: 'preview',
      label: 'Voir la page publiée',
      description: 'Ouvrir le rendu final tel qu’il apparaît aux proches.',
      href: memorial.publicUrl,
      external: true,
      primary: true,
    };
  }

  if (memorial.generationStatus === 'not_started') {
    return {
      id: 'generate',
      label: 'Préparer le texte',
      description: 'Lancer ou reprendre la première version du texte.',
      href: `/dashboard/${memorial.id}/generate`,
      primary: true,
    };
  }

  if (memorial.generationStatus === 'generated') {
    return {
      id: 'text',
      label: 'Relire le texte',
      description: 'Ajuster la première version avant la composition finale.',
      href: `/dashboard/${memorial.id}/text`,
      primary: true,
    };
  }

  return {
    id: 'validate',
    label: 'Reprendre la composition',
    description: 'Retoucher le rendu final, l’ambiance et les derniers détails.',
    href: getValidateUrl(memorial.id),
    primary: true,
  };
}

export function getDashboardActions(memorial: UserMemorialItem): DashboardAction[] {
  const primary = getPrimaryDashboardAction(memorial);
  const actions: DashboardAction[] = [
    primary,
    {
      id: 'preview',
      label: 'Ouvrir l’aperçu',
      description: 'Voir le rendu réel avant la publication.',
      href: `/memorial/${memorial.id}/preview`,
    },
    {
      id: 'contributors',
      label: 'Inviter des proches',
      description: 'Partager l’accès aux personnes qui souhaitent contribuer.',
      href: `/dashboard/${memorial.id}/contributors`,
    },
    {
      id: 'messages',
      label: 'Voir les messages',
      description: 'Relire les contributions déjà reçues.',
      href: `/dashboard/${memorial.id}/messages`,
    },
    {
      id: 'style',
      label: 'Choisir l’ambiance',
      description: 'Ajuster le modèle final, le ton et la direction visuelle.',
      href: getValidateUrl(memorial.id),
    },
    {
      id: 'media',
      label: 'Gérer la musique',
      description: 'Ajouter des médias, une musique ou préparer le film souvenir.',
      href: '/espace/medias',
    },
    {
      id: 'video',
      label: 'Générer le film MP4',
      description: 'Préparer un diaporama vidéo à partir de la galerie.',
      href: '/espace/video-hommage',
    },
  ];

  return actions.filter((action, index, list) => list.findIndex((item) => item.id === action.id) === index).slice(0, 5);
}

export function buildRecentDashboardActivity(
  data: UserDashboardData,
  focusMemorialId?: string
): DashboardActivityItem[] {
  const focusMessages = data.messages
    .filter((message) => !focusMemorialId || message.memoryId === focusMemorialId)
    .map((message) => ({
      id: `message-${message.id}`,
      type: 'message' as const,
      title: message.authorName || 'Un proche',
      description: `a laissé un message sur ${message.memoryTitle}`,
      href: `/dashboard/${message.memoryId}/messages`,
      createdAt: message.createdAt,
    }));

  const focusCandles = data.candles
    .filter((candle) => !focusMemorialId || candle.memoryId === focusMemorialId)
    .map((candle) => ({
      id: `candle-${candle.id}`,
      type: 'candle' as const,
      title: candle.authorName || 'Un visiteur',
      description: `a allumé une bougie pour ${candle.memoryTitle}`,
      href: `/dashboard/${candle.memoryId}/messages`,
      createdAt: candle.createdAt,
    }));

  const focusCollaborations = (data.recentCollaborationActivity || [])
    .filter((entry) => !focusMemorialId || entry.memoryId === focusMemorialId)
    .map((entry) => ({
      id: `collab-${entry.id}`,
      type: 'collaboration' as const,
      title: entry.actorEmail || 'Un proche',
      description: `a fait évoluer ${entry.memoryTitle}`,
      href: `/dashboard/${entry.memoryId}/contributors`,
      createdAt: entry.createdAt,
    }));

  return [...focusMessages, ...focusCandles, ...focusCollaborations]
    .sort((left, right) => String(right.createdAt || '').localeCompare(String(left.createdAt || '')))
    .slice(0, 6);
}

function getMemorialMomentumScore(memorial: UserMemorialItem): number {
  let score = 0;

  if (memorial.canAdminister) score += 3;
  if (memorial.publicationStatus === 'published') score += 2;
  if (memorial.generationStatus === 'edited') score += 5;
  if (memorial.generationStatus === 'generated') score += 4;
  score += memorial.pendingMessagesCount * 4;
  score += memorial.messagesCount * 2;
  score += memorial.photosCount;
  score += memorial.candlesCount;

  return score;
}
