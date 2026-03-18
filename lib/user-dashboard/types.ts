export interface UserMemorialItem {
  id: string;
  title: string;
  communType?: 'deces' | 'hommage-vivant' | 'transmission-familiale' | 'memoire-objet' | 'pro-ceremonie';
  subjectFirstName?: string;
  subjectLastName?: string;
  profilePhotoUrl?: string;
  accessRole?: 'owner' | 'editor' | 'contributor' | 'viewer';
  canAdminister?: boolean;
  isOwned?: boolean;
  createdAt: string;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'canceled' | 'chargeback';
  publicationStatus: 'draft' | 'published' | 'archived';
  generationStatus: 'not_started' | 'generated' | 'edited';
  formula: string;
  expiresAt?: string | null;
  photosCount: number;
  messagesCount: number;
  candlesCount: number;
  pendingMessagesCount: number;
  publicUrl: string;
  imageThemes?: string[];
}

export interface UserDashboardData {
  user: {
    id: string;
    email: string;
    name?: string;
    createdAt?: string | null;
  };
  summary: {
    memorialCount: number;
    draftCount: number;
    publishedCount: number;
    totalMessages: number;
    totalCandles: number;
    collaborationCount?: number;
    pendingCollaborationInvitesCount?: number;
  };
  memorials: UserMemorialItem[];
  collaborations?: Array<{
    id: string;
    title: string;
    role: 'owner' | 'editor' | 'contributor' | 'viewer';
    joinedAt: string | null;
    lastSeenAt: string | null;
    publicationStatus: 'draft' | 'published' | 'archived';
    publicUrl: string;
  }>;
  pendingCollaborationInvites?: Array<{
    id: string;
    memoryId: string;
    title: string;
    role: 'owner' | 'editor' | 'contributor' | 'viewer';
    expiresAt: string;
    createdAt: string;
  }>;
  recentCollaborationActivity?: Array<{
    id: string;
    memoryId: string;
    memoryTitle: string;
    actorEmail: string | null;
    actorRole: string | null;
    action: string;
    source: string;
    metadata: Record<string, unknown>;
    createdAt: string;
  }>;
  messages: Array<{
    id: string;
    memoryId: string;
    memoryTitle: string;
    authorName: string;
    content: string;
    createdAt: string;
    status: 'approved' | 'pending' | 'flagged';
    accessRole?: 'owner' | 'editor' | 'contributor' | 'viewer';
    canModerate?: boolean;
  }>;
  candles: Array<{
    id: string;
    memoryId: string;
    memoryTitle: string;
    authorName: string;
    createdAt: string;
  }>;
}
