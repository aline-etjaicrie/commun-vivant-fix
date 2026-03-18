import { QuestionnaireData } from '@/lib/schema';
import { STORAGE_KEYS } from '@/lib/creationFlowStorage';

export type MemorialSource = 'questionnaire' | 'alma';

export interface MemorialFinalizationPayload {
  source: MemorialSource;
  context: string;
  communType?: string;
  subjectName: string;
  style?: string;
  narrativeSeed: string;
  data: Record<string, any>;
  createdAt: string;
}

export function buildFinalizationPayloadFromQuestionnaire(
  data: Partial<QuestionnaireData>,
  context: string,
  communType?: string
): MemorialFinalizationPayload {
  return {
    source: 'questionnaire',
    context,
    communType,
    subjectName: data.identite?.prenom || '',
    style: data.style || undefined,
    narrativeSeed: data.resume || data.message?.content || data.messageLibre || '',
    data: data as Record<string, any>,
    createdAt: new Date().toISOString(),
  };
}

export function buildFinalizationPayloadFromAlma(params: {
  context: string;
  communType?: string;
  subjectName?: string;
  preferredStyle?: string;
  collectedInfo?: Record<string, any>;
  teaserText?: string;
}): MemorialFinalizationPayload {
  return {
    source: 'alma',
    context: params.context,
    communType: params.communType,
    subjectName: params.subjectName || '',
    style: params.preferredStyle,
    narrativeSeed: params.teaserText || '',
    data: {
      collectedInfo: params.collectedInfo || {},
      teaserText: params.teaserText || '',
      preferredStyle: params.preferredStyle || '',
    },
    createdAt: new Date().toISOString(),
  };
}

export function getFinalizationStorageKey(isolated: boolean): string {
  return isolated ? STORAGE_KEYS.memorialFinalizationDev : STORAGE_KEYS.memorialFinalization;
}

export function persistFinalizationPayload(
  payload: MemorialFinalizationPayload,
  isolated: boolean
): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(getFinalizationStorageKey(isolated), JSON.stringify(payload));
}
