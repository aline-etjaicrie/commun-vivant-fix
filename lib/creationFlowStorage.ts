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

/**
 * Efface toutes les données d'un ancien parcours.
 * À appeler au début de chaque nouveau questionnaire, avant toute lecture du localStorage.
 */
export function clearPreviousCreationFlow(): void {
  if (typeof window === 'undefined') return;

  const KEYS_TO_CLEAR: string[] = [
    STORAGE_KEYS.generatedMemorialText,
    STORAGE_KEYS.questionnaireData,
    STORAGE_KEYS.questionnaireDataDev,
    STORAGE_KEYS.vivantQuestionnaireData,
    STORAGE_KEYS.transmissionQuestionnaireData,
    STORAGE_KEYS.objetQuestionnaireData,
    STORAGE_KEYS.solennQuestionnaireData,
    STORAGE_KEYS.memorialFinalization,
    STORAGE_KEYS.memorialFinalizationDev,
    STORAGE_KEYS.mediaData,
    STORAGE_KEYS.currentMemorialId,
    STORAGE_KEYS.creationFlow,
    STORAGE_KEYS.context,
    'memorialPreviewData',
    'alma_context',
    'alma_commun_type',
    'alma_genre',
    'alma_preferred_style',
    'alma_subject_name',
    'alma_teaser_text',
    'alma_collected_info',
  ];

  KEYS_TO_CLEAR.forEach((key) => localStorage.removeItem(key));

  Object.keys(localStorage)
    .filter(
      (key) =>
        key.startsWith('questionnaire-memoire-') ||
        key.startsWith('questionnaire-dev-') ||
        key.startsWith('almaConversation_') ||
        key.startsWith('draftAccessToken:') ||
        key.startsWith('flowers-') ||
        key.startsWith('user-action-')
    )
    .forEach((key) => localStorage.removeItem(key));
}
