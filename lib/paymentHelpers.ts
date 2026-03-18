/**
 * Utilitaires pour la gestion des paiements et des accès Alma
 */

import { supabase } from './supabase';
import { generateUuid, isUuid } from './ids';
import { SUCCESSFUL_PAYMENT_STATUSES } from './paymentStatus';
import { isTesterUser } from './testerAccess';

/**
 * Vérifie si un utilisateur a accès à Alma (beta ou payé)
 * @param userId - ID de l'utilisateur Supabase
 * @param memorialId - ID du mémorial en cours de création
 * @returns true si l'utilisateur a accès (beta ou payé), false sinon
 */
export async function checkAlmaAccess(
  userId: string,
  memorialId: string,
  userEmail?: string | null
): Promise<boolean> {
  if (isTesterUser({ id: userId, email: userEmail }, { publicOnly: true })) {
    return true;
  }

  // Vérifier accès beta (client-side cache)
  if (typeof window !== 'undefined') {
    const betaAccess = localStorage.getItem('alma_beta_access');
    if (betaAccess === 'true') {
      return true;
    }

    // Vérifier cache localStorage pour paiement
    const paidCache = localStorage.getItem(`alma_paid_${memorialId}`);
    if (paidCache === 'true') {
      return true;
    }
  }

  // Vérifier dans Supabase (authoritative source)
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('payment_status')
      .eq('common_id', memorialId)
      .in('payment_status', [...SUCCESSFUL_PAYMENT_STATUSES])
      .maybeSingle();

    if (error) {
      console.error('Error checking payment status:', error);
      return false;
    }

    if (data) {
      // Sync avec le cache local si disponible
      if (typeof window !== 'undefined') {
        localStorage.setItem(`alma_paid_${memorialId}`, 'true');
      }
      return true;
    }

    return false;
  } catch (error) {
    console.error('Exception checking Alma access:', error);
    return false;
  }
}

/**
 * Marque l'accès beta comme accordé pour cet utilisateur
 * @param userId - ID de l'utilisateur
 */
export function grantBetaAccess(userId: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('alma_beta_access', 'true');
    localStorage.setItem(`alma_beta_user_${userId}`, 'true');
    localStorage.setItem('alma_beta_granted_at', new Date().toISOString());
  }
}

/**
 * Génère un ID unique pour un mémorial
 * @returns Un UUID compatible avec les tables Supabase
 */
export function generateMemorialId(): string {
  return generateUuid();
}

/**
 * Récupère ou crée un memorial ID depuis localStorage
 * @returns Memorial ID actif
 */
export function getOrCreateMemorialId(): string {
  if (typeof window === 'undefined') {
    return generateMemorialId();
  }

  const existing = localStorage.getItem('currentMemorialId');
  if (existing && isUuid(existing)) {
    return existing;
  }

  const newId = generateMemorialId();
  localStorage.setItem('currentMemorialId', newId);
  return newId;
}

/**
 * Marque un mémorial comme payé dans le cache local
 * @param memorialId - ID du mémorial
 */
export function markMemorialAsPaid(memorialId: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(`alma_paid_${memorialId}`, 'true');
    localStorage.setItem(`payment_completed_at_${memorialId}`, new Date().toISOString());
  }
}

/**
 * Sauvegarde les données contextuelles pour la preview
 * @param context - Type de contexte (funeral, living_story, object_memory)
 * @param subjectName - Nom du sujet
 * @param genre - Genre grammatical
 */
export function saveAlmaContext(
  context: 'funeral' | 'living_story' | 'object_memory',
  subjectName: string,
  genre: 'Elle' | 'Il' | 'Sans genre spécifié'
): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('alma_context', context);
    localStorage.setItem('alma_subject_name', subjectName);
    localStorage.setItem('alma_genre', genre);
  }
}

/**
 * Récupère les données contextuelles sauvegardées
 * @returns Contexte Alma ou null si non trouvé
 */
export function getAlmaContext(): {
  context: 'funeral' | 'living_story' | 'object_memory';
  subjectName: string;
  genre: 'Elle' | 'Il' | 'Sans genre spécifié';
} | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const context = localStorage.getItem('alma_context');
  const subjectName = localStorage.getItem('alma_subject_name');
  const genre = localStorage.getItem('alma_genre');

  if (!context || !subjectName || !genre) {
    return null;
  }

  return {
    context: context as 'funeral' | 'living_story' | 'object_memory',
    subjectName,
    genre: genre as 'Elle' | 'Il' | 'Sans genre spécifié',
  };
}

/**
 * Récupère la conversation Alma depuis localStorage
 * @param context - Type de contexte
 * @returns Tableau de messages ou null
 */
export function getAlmaConversation(context: string): Array<{
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}> | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const stored = localStorage.getItem(`almaConversation_${context}`);
  if (!stored) {
    return null;
  }

  try {
    return JSON.parse(stored);
  } catch (error) {
    console.error('Error parsing conversation:', error);
    return null;
  }
}

/**
 * Crée un hash simple de la conversation pour le cache
 * @param conversation - Tableau de messages
 * @returns Hash de la conversation
 */
export function hashConversation(conversation: Array<{ role: string; content: string }>): string {
  const content = conversation.map(m => m.content).join('|');
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36);
}
