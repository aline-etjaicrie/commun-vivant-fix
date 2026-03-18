export const ALMA_QUESTIONNAIRE_ISOLATION_FLAG =
  process.env.NEXT_PUBLIC_ALMA_QUESTIONNAIRE_ISOLATED === 'true';

type SearchParamsLike = { get: (key: string) => string | null } | null | undefined;

export function isIsolatedCreationFlow(params: SearchParamsLike): boolean {
  return params?.get('isolated') === '1' || ALMA_QUESTIONNAIRE_ISOLATION_FLAG;
}

export function getQuestionnaireDraftStorageKey(
  context: string,
  isolated: boolean,
  communType?: string
): string {
  const suffix = communType ? `-${communType}` : '';
  return isolated ? `questionnaire-dev-${context}${suffix}` : `questionnaire-memoire-${context}${suffix}`;
}

export function getQuestionnaireFinalStorageKey(isolated: boolean): string {
  return isolated ? 'questionnaireData_dev' : 'questionnaireData';
}

export function getAlmaPrefillStorageKey(isolated: boolean): string {
  return isolated ? 'alma_prefill_dev' : 'alma_prefill';
}
