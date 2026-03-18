/**
 * Feature Flags pour gérer les fonctionnalités beta et la tarification
 */

export const FEATURES = {
  // Mode beta gratuit pour Alma (passer à false pour activer le paywall)
  ALMA_BETA_FREE: process.env.NEXT_PUBLIC_ALMA_BETA_FREE === 'true',
  // Isole Alma + questionnaire des cles/flux de prod
  ALMA_QUESTIONNAIRE_ISOLATED: process.env.NEXT_PUBLIC_ALMA_QUESTIONNAIRE_ISOLATED === 'true',

  // Tarification de base Alma
  ALMA_BASE_PRICE: 79, // € pour contexte funeral/living_story
  ALMA_OBJECT_PRICE: 49, // € pour contexte object_memory
};

/**
 * Vérifie si le mode beta gratuit Alma est actif
 */
export function isAlmaBetaActive(): boolean {
  return FEATURES.ALMA_BETA_FREE;
}

export function isAlmaQuestionnaireIsolationEnabled(): boolean {
  return FEATURES.ALMA_QUESTIONNAIRE_ISOLATED;
}

/**
 * Retourne le prix de base selon le contexte
 */
export function getAlmaBasePrice(context: 'funeral' | 'living_story' | 'object_memory'): number {
  return context === 'object_memory' ? FEATURES.ALMA_OBJECT_PRICE : FEATURES.ALMA_BASE_PRICE;
}

/**
 * Retourne le message du CTA selon le mode (beta ou prod)
 */
export function getUnlockCTAText(): string {
  return isAlmaBetaActive()
    ? "Accéder gratuitement (Beta)"
    : "Débloquer mon commun";
}
