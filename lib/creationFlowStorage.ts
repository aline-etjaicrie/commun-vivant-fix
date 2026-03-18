export const STORAGE_KEYS = {
  context: 'context',
  creationFlow: 'creation_flow',
  mediaData: 'mediaData',
  imageThemes: 'image_themes',
  currentMemorialId: 'currentMemorialId',
  generatedMemorialText: 'generatedMemorialText',
  questionnaireData: 'questionnaireData',
  questionnaireDataDev: 'questionnaireData_dev',
  memorialFinalization: 'memorial_finalization',
  memorialFinalizationDev: 'memorial_finalization_dev',
  vivantQuestionnaireData: 'vivantQuestionnaireData',
  transmissionQuestionnaireData: 'transmissionQuestionnaireData',
  objetQuestionnaireData: 'objetQuestionnaireData',
  solennQuestionnaireData: 'solennQuestionnaireData',
} as const;

const QUESTIONNAIRE_DRAFT_PREFIXES = ['questionnaire-memoire-', 'questionnaire-dev-'] as const;
const ALMA_CONVERSATION_KEYS = [
  'almaConversation_funeral',
  'almaConversation_living_story',
  'almaConversation_object_memory',
] as const;

export function getQuestionnaireDraftKey(keys: string[] = []): string | null {
  const source = keys.length > 0 ? keys : Object.keys(localStorage);
  return (
    source.find((key) => QUESTIONNAIRE_DRAFT_PREFIXES.some((prefix) => key.startsWith(prefix))) || null
  );
}

export function getQuestionnaireDataRaw(): string | null {
  return (
    localStorage.getItem(STORAGE_KEYS.questionnaireData) ||
    localStorage.getItem(STORAGE_KEYS.vivantQuestionnaireData) ||
    localStorage.getItem(STORAGE_KEYS.transmissionQuestionnaireData) ||
    localStorage.getItem(STORAGE_KEYS.objetQuestionnaireData) ||
    localStorage.getItem(STORAGE_KEYS.solennQuestionnaireData) ||
    localStorage.getItem(STORAGE_KEYS.questionnaireDataDev) ||
    (() => {
      const key = getQuestionnaireDraftKey();
      return key ? localStorage.getItem(key) : null;
    })()
  );
}

export function getFinalizationRaw(): string | null {
  return (
    localStorage.getItem(STORAGE_KEYS.memorialFinalization) ||
    localStorage.getItem(STORAGE_KEYS.memorialFinalizationDev)
  );
}

export function getAnyAlmaConversationRaw(): string | null {
  for (const key of ALMA_CONVERSATION_KEYS) {
    const value = localStorage.getItem(key);
    if (value) return value;
  }
  return null;
}
