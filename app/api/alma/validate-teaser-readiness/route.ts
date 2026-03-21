import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

/**
 * Valide que la conversation a assez de matière avant de générer un teaser
 * Vérifie:
 * - userMessageCount >= MIN_USER_MESSAGES
 * - Présence d'infos extraites (au moins un nom ou une anecdote)
 */
export async function POST(request: NextRequest) {
  try {
    const {
      conversationHistory = [],
      collectedInfo = {},
      userMessageCount = 0,
      minRequired = 3,
    } = await request.json();

    // RÈGLE 1: Vérifier le nombre minimum de messages utilisateur
    if (userMessageCount < minRequired) {
      return NextResponse.json({
        isReady: false,
        message: `Il me manque encore quelques éléments pour rédiger une base fidèle. Vous avez partagé ${userMessageCount}/${minRequired} points clés.`,
      }, { status: 200 });
    }

    // RÈGLE 2: Vérifier qu'il y a au moins quelque chose d'extrait
    const hasCollectedInfo = Object.keys(collectedInfo).length > 0;
    
    if (!hasCollectedInfo) {
      return NextResponse.json({
        isReady: false,
        message: 'Partagez-moi un peu plus sur cette personne ou cet objet. Un souvenir, un trait de caractère...',
      }, { status: 200 });
    }

    // RÈGLE 3: Vérifier qu'il y a assez de substance dans la conversation (pas juste des monosyllabes)
    const userMessages = conversationHistory
      .filter((m: any) => m.role === 'user')
      .map((m: any) => m.content || '');

    const totalWordCount = userMessages.reduce((sum, msg) => sum + (msg.split(/\s+/).length || 0), 0);
    
    if (totalWordCount < 20) {
      return NextResponse.json({
        isReady: false,
        message: 'Un peu plus de détails, s\'il vous plaît. Racontez-moi une anecdote, une passion, un souvenir...',
      }, { status: 200 });
    }

    // ✅ Tout va bien
    return NextResponse.json({
      isReady: true,
      message: 'Prêt à générer!',
    }, { status: 200 });

  } catch (error) {
    console.error('❌ Erreur validation teaser readiness:', error);
    return NextResponse.json({
      isReady: false,
      message: 'Erreur validation technique',
    }, { status: 500 });
  }
}
