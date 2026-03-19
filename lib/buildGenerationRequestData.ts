type BuildGenerationRequestDataInput = {
  questionnaire?: any;
  media?: any;
  previewData?: any;
  context?: string | null;
  communType?: string | null;
  almaConversationText?: string | null;
};

function toObject<T = Record<string, unknown>>(value: unknown): T {
  return value && typeof value === 'object' ? (value as T) : ({} as T);
}

export function buildGenerationRequestData(input: BuildGenerationRequestDataInput) {
  const questionnaire = toObject<any>(input.questionnaire);
  const media = toObject<any>(input.media);
  const previewData = toObject<any>(input.previewData);

  const writingStyle =
    previewData?.writingStyle ||
    previewData?.style ||
    questionnaire?.writingStyle ||
    questionnaire?.style ||
    undefined;

  return {
    ...questionnaire,
    ...(media && Object.keys(media).length > 0 ? { medias: media } : {}),
    ...(previewData?.identite ? { identite: { ...(questionnaire?.identite || {}), ...previewData.identite } } : {}),
    ...(previewData?.gouts ? { gouts: { ...(questionnaire?.gouts || {}), ...previewData.gouts } } : {}),
    ...(previewData?.liensWeb ? { liensWeb: previewData.liensWeb } : {}),
    ...(previewData?.family ? { family: previewData.family } : {}),
    ...(previewData?.message ? { message: previewData.message } : {}),
    ...(previewData?.compositionModel ? { compositionModel: previewData.compositionModel } : {}),
    ...(previewData?.layout ? { layout: previewData.layout } : {}),
    ...(previewData?.visualTheme ? { visualTheme: previewData.visualTheme } : {}),
    ...(previewData?.template ? { template: previewData.template } : {}),
    ...(previewData?.textTypography ? { textTypography: previewData.textTypography } : {}),
    ...(previewData?.tributeMode ? { tributeMode: previewData.tributeMode } : {}),
    ...(writingStyle ? { writingStyle, style: writingStyle } : {}),
    ...(input.almaConversationText ? { almaConversationText: input.almaConversationText } : {}),
    ...(input.context ? { context: input.context } : {}),
    ...(input.communType ? { communType: input.communType } : {}),
  };
}
